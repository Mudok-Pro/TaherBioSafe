
import type { Timestamp, FieldValue } from 'firebase/firestore';

export type UserRole = 'owner' | 'admin' | 'customer' | 'driver';
export type CustomerTier = 'standard' | 'recommended' | 'partner';
export type ContractStatus = 'requested' | 'approving' | 'failed' | 'awaiting_signatures' | 'active' | 'completed' | 'expired' | 'archived';
export type WasteType = 'chemical' | 'biohazard' | 'medical' | 'industrial' | 'general';
export type PickupStatus = 'requested' | 'scheduled' | 'completed' | 'cancelled';
export type Language = 'en' | 'ar';

export interface User {
  id: string; // Firebase UID
  name: string;
  email: string;
  role: UserRole;
  tier?: CustomerTier;
  avatarUrl?: string;
  createdAt?: Timestamp | FieldValue | string; 
  updatedAt?: Timestamp | FieldValue | string;
}

export interface Contract {
  id: string; // Firestore document ID
  customerId: string;
  customerName?: string; // This will be the Representative Name
  customerEmail?: string;
  companyName?: string;
  address?: string; // Added for the template
  city?: string; // Added for the template
  contactTitle?: string; // Added for the template
  serviceDescription: string;
  tier: CustomerTier;
  status: ContractStatus;
  requestedDate: Timestamp | string; 
  createdAt: Timestamp | FieldValue | string;
  updatedAt?: Timestamp | FieldValue | string;
  startDate?: Timestamp | string;
  endDate?: Timestamp | string;
  documentUrl?: string; // Could be the final signed PDF URL from PandaDoc
  pandaDocId?: string; // The ID of the document in PandaDoc
  customerSignature?: string;
  ownerSignature?: string;
  archived?: boolean;
  notes?: string;
  lastError?: string;
  approvedBy?: string;
}

export interface PickupOrder {
  id: string; // Firestore document ID
  customerId: string;
  customerName?: string; 
  customerEmail?: string; 
  wasteType: WasteType;
  quantity: string; // Changed from optional, ensure form handles this
  preferredDate: Timestamp; // Stored as Firestore Timestamp
  actualPickupDate?: Timestamp; 
  status: PickupStatus;
  driverId?: string;
  driverName?: string; 
  notes?: string;
  address?: string; 
  createdAt: Timestamp | FieldValue; // Use FieldValue for serverTimestamp
  updatedAt?: Timestamp | FieldValue;
}

export interface IncinerationReport {
  id: string;
  date: Timestamp | string;
  facility: string;
  originalContent: string;
  summary?: string;
  categories?: string[];
  keyMetrics?: Record<string, string>;
  generatedBy?: string;
  createdAt: Timestamp | FieldValue | string;
}

// This mockUser is for local/context fallback, not primary user source
export const mockUser: User = {
  id: 'mock-user-123',
  name: 'Djamel Khermiche', // Algerian name
  email: 'djamel.khermiche@example.dz',
  role: 'customer',
  tier: 'standard',
  avatarUrl: 'https://source.unsplash.com/100x100/?portrait,algerian',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
