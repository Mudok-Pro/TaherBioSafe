
// src/app/api/contracts/request/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
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
  try {
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

    // In Firebase ID tokens, the user's ID is in the 'sub' or 'user_id' claim.
    const uid = decodedToken.sub || decodedToken.user_id;
    const email = decodedToken.email;

    if (!uid || !email) {
        return NextResponse.json({ error: 'Unauthorized: Token is missing user information' }, { status: 401 });
    }

    const formData = await request.json();
    
    const newContractData = {
        customerId: uid,
        customerEmail: email,
        status: 'requested' as const,
        requestedDate: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        customerName: formData.contactPerson || null,
        contactTitle: formData.contactTitle || null,
        companyName: formData.companyName || null,
        address: formData.address || null,
        city: formData.city || null,
        serviceDescription: formData.serviceDescription || null,
        tier: formData.requestedTier || 'standard',
        customerSignature: formData.customerSignature || null,
        pandaDocId: null,
        lastError: null,
        approvedBy: null,
        startDate: null,
        endDate: null,
        documentUrl: null,
        ownerSignature: null,
        archived: false,
        notes: null,
    };

    const docRef = await addDoc(collection(db, 'contracts'), newContractData);

    console.log(`✅ New contract request created with ID: ${docRef.id}`);

    return NextResponse.json({ message: 'Contract request submitted successfully', contractId: docRef.id }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating contract request:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
