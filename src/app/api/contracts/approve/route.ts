
// src/app/api/contracts/approve/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, runTransaction, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import type { Contract } from '@/types';

// Helper function to decode a simple base64-encoded JWT payload.
// NOTE: This does NOT verify the signature. Verification should happen before calling this.
// In a real high-security app, a robust JWT library would be used.
function decodeJwtPayload(token: string): any {
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    return JSON.parse(decodedJson);
  } catch (e) {
    console.error("Error decoding JWT payload:", e);
    return null;
  }
}


export async function POST(request: Request) {
  const { contractId } = await request.json();

  // 1. Authenticate and Authorize Admin
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];
  
  // NOTE: In a real production environment, you would verify this idToken with Firebase Admin SDK
  // or another backend service. For this prototype, we'll decode it to get the claims.
  // This is NOT secure for production as it doesn't verify the token's signature.
  const decodedToken = decodeJwtPayload(idToken);
  
  if (!decodedToken) {
     return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
  
  const userRole = decodedToken.role;
  const userId = decodedToken.user_id;

   if (!['admin', 'owner'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden: User is not an admin' }, { status: 403 });
  }

  if (!contractId) {
    return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
  }
  const contractDocRef = doc(db, 'contracts', contractId);

  try {
    // 2. Lock the document via a Firestore Transaction
    await runTransaction(db, async (transaction) => {
      const contractSnapshot = await transaction.get(contractDocRef);
      if (!contractSnapshot.exists()) throw { status: 404, message: 'Contract not found' };
      
      const contractData = contractSnapshot.data() as Contract;
      if (!['requested', 'failed'].includes(contractData.status)) {
        throw { status: 409, message: 'Conflict: This contract has already been processed.' };
      }

      transaction.update(contractDocRef, { status: 'approving', lastError: null, approvedBy: userId });
    });
    console.log(`[Transaction Success] Contract ${contractId} is now locked.`);

    const contractSnapshot = await getDoc(contractDocRef);
    const contractData = contractSnapshot.data() as Contract;
    
    // 3. Prepare the PandaDoc Payload
    const { PANDADOC_API_KEY, PANDADOC_API_BASE_URL, PANDADOC_TEMPLATE_ID, PANDADOC_OWNER_EMAIL } = process.env;
    if (!PANDADOC_API_KEY || !PANDADOC_API_BASE_URL || !PANDADOC_TEMPLATE_ID || !PANDADOC_OWNER_EMAIL) {
        throw new Error("Server configuration error: PandaDoc environment variables are missing.");
    }

    const recipients = [
      {
        email: contractData.customerEmail,
        first_name: contractData.customerName?.split(' ')[0] || 'Valued',
        last_name: contractData.customerName?.split(' ').slice(1).join(' ') || 'Customer',
        role: "Client", 
        signing_order: 1,
      },
      {
        email: PANDADOC_OWNER_EMAIL,
        first_name: "AbdelGhani", // Or from .env
        last_name: "Merghadi",  // Or from .env
        role: "Owner", 
        signing_order: 2,
      },
    ];

    const fields = {
      "Client.Name": { "value": contractData.customerName },
      "Client.Company": { "value": contractData.companyName },
      "Client.Address": { "value": contractData.address },
      "Date.Now": { "value": new Date().toLocaleDateString('en-US') },
      "Client.Activity.Type": { "value": contractData.serviceDescription }
    };
    
    const pandaDocPayload = {
      name: `Service Contract - ${contractData.companyName || contractId}`,
      template_uuid: PANDADOC_TEMPLATE_ID,
      recipients,
      fields,
      metadata: { firestore_contract_id: contractId },
      tags: ["api-generated", contractData.tier || "standard"],
    };

    // 4. Create the document in PandaDoc
    console.log("🐼 Sending this payload to PandaDoc:", JSON.stringify(pandaDocPayload, null, 2));
    const createDocResponse = await axios.post(`${PANDADOC_API_BASE_URL}/public/v1/documents`, pandaDocPayload, {
      headers: { 'Authorization': `API-Key ${PANDADOC_API_KEY}`, 'Content-Type': 'application/json' },
      timeout: 15000
    });
    const documentId = createDocResponse.data.id;
    console.log(`[PandaDoc] Created document with ID: ${documentId}.`);

    // 5. Poll for readiness and send directly within the main function
    const maxRetries = 10;
    const delay = 2500;
    let documentSent = false;

    for (let i = 0; i < maxRetries; i++) {
        await new Promise(r => setTimeout(r, delay));
        const detailsResponse = await axios.get(`${PANDADOC_API_BASE_URL}/public/v1/documents/${documentId}/details`, {
            headers: { 'Authorization': `API-Key ${PANDADOC_API_KEY}` }
        });
        const currentStatus = detailsResponse.data.status;
        console.log(`[Polling Attempt ${i + 1}/${maxRetries}] Document status is: ${currentStatus}`);

        if (currentStatus === 'document.draft') {
            console.log(`🚀 Document is ready! Attempting to send...`);
            await axios.post(`${PANDADOC_API_BASE_URL}/public/v1/documents/${documentId}/send`, {
                message: 'Please review and sign the service contract.',
                subject: `Action Required: Service Contract for ${contractData.companyName}`,
            }, { headers: { 'Authorization': `API-Key ${PANDADOC_API_KEY}` } });
            console.log(`✅ Document sent successfully!`);
            documentSent = true;
            break;
        }

        if (currentStatus !== 'document.uploaded') {
            console.warn(` PDoc document is in an unexpected state '${currentStatus}' and cannot be sent.`);
        }
    }

    if (!documentSent) {
      throw new Error(`Document ${documentId} was not ready to be sent after ${maxRetries} attempts.`);
    }

    // 6. Update Firestore with the final success state
    await updateDoc(contractDocRef, {
      status: 'awaiting_signatures',
      pandaDocId: documentId,
      updatedAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
    });

    return NextResponse.json({ message: 'Contract approved and processed successfully!', pandaDocId: documentId }, { status: 200 });

  } catch (error: any) {
    // 7. Catch any errors and update Firestore
    const errorMessage = error.response?.data?.detail || error.message;
    console.error(`❌ [FATAL] Flow failed for contract ${contractId}:`, errorMessage);
    if(axios.isAxiosError(error)) {
        console.error("🐼 PandaDoc Error Details:", JSON.stringify(error.response?.data, null, 2));
    }
    
    await updateDoc(contractDocRef, { status: 'failed', lastError: errorMessage });
    const status = (axios.isAxiosError(error) && error.response?.status) || 500;
    return NextResponse.json({ error: "Failed to process contract.", details: errorMessage }, { status });
  }
}
