
// src/app/api/pandadoc/webhook/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Contract } from '@/types';
import * as crypto from 'crypto';

// PandaDoc sends an array of events in each webhook request
interface PandaDocWebhookEvent {
  event: string;
  data: {
    id: string; // The PandaDoc Document ID
    status: string;
    metadata: {
      firestore_contract_id?: string;
    };
    recipients: {
      id: string;
      email: string;
      role: string;
      has_completed: boolean;
    }[];
    date_completed?: string; // ISO 8601 date string
  };
}

/**
 * Verifies the signature of the incoming webhook request to ensure it's from PandaDoc.
 */
function verifyPandaDocSignature(signature: string, requestBody: string): boolean {
  const secret = process.env.PANDADOC_SECRET_KEY;
  if (!secret) {
    console.error("PandaDoc webhook secret key is not set in environment variables (PANDADOC_SECRET_KEY).");
    return false;
  }

  const hash = crypto.createHmac("sha256", secret).update(requestBody).digest("hex");
  
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch (e) {
    console.error("Error during timingSafeEqual, likely due to mismatched buffer lengths:", e);
    return false;
  }
}


export async function POST(request: Request) {
  try {
    const rawRequestBody = await request.text();
    const signature = request.headers.get("x-hub-signature");

    if (!signature) {
      console.warn("🐼 [Webhook] Received request without signature. Rejecting.");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    if (!verifyPandaDocSignature(signature, rawRequestBody)) {
        console.error("🐼 [Webhook] Invalid PandaDoc webhook signature. Rejecting.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const payload = JSON.parse(rawRequestBody);
    console.log("🐼 [Webhook] Received verified payload:", JSON.stringify(payload, null, 2));

    if (!Array.isArray(payload)) {
      console.warn("🐼 [Webhook] Received non-array payload. Ignoring.");
      return NextResponse.json({ message: "Payload must be an array." }, { status: 400 });
    }

    for (const event of payload as PandaDocWebhookEvent[]) {
      if (event.event === 'document_state_changed' && event.data.status === 'document.completed') {
        await handleDocumentCompleted(event);
      } else {
        console.log(`🐼 [Webhook] Skipping unhandled event: ${event.event} with status: ${event.data.status}`);
      }
    }

    return NextResponse.json({ message: 'Webhook received successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error("❌ [Webhook] Error processing webhook:", error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

async function handleDocumentCompleted(event: PandaDocWebhookEvent) {
  const { id: pandaDocId, metadata, date_completed } = event.data;
  const firestoreContractId = metadata?.firestore_contract_id;

  if (!firestoreContractId) {
    console.error(`🐼 [Webhook] ❗️ Critical: Document ${pandaDocId} completed but has no firestore_contract_id in metadata.`);
    return;
  }

  console.log(`✅ [Webhook] Processing completion for contract ID: ${firestoreContractId}`);
  const contractDocRef = adminDb.collection('contracts').doc(firestoreContractId);

  try {
    const doc = await contractDocRef.get();
    if (!doc.exists) {
      console.error(`🐼 [Webhook] ❗️ Error: Firestore contract with ID ${firestoreContractId} not found.`);
      return;
    }

    const contractData = doc.data() as Contract;
    if (contractData.status === 'active') {
        console.log(`[Webhook] Contract ${firestoreContractId} is already active. No update needed.`);
        return;
    }

    const startDate = date_completed ? new Date(date_completed) : new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    await contractDocRef.update({
      status: 'active',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      documentUrl: `https://app.pandadoc.com/a/#/documents/${pandaDocId}`,
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log(`✅ [Webhook] Successfully updated contract ${firestoreContractId} to 'active'.`);

  } catch (error) {
    console.error(`❌ [Webhook] Failed to update Firestore for contract ${firestoreContractId}:`, error);
  }
}
