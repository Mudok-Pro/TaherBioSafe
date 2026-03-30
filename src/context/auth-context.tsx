'use client';

import type { User, UserRole, CustomerTier } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, type FieldValue, deleteField } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useLanguage } from './language-context';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loginWithFirebase: (fbUser: FirebaseUser, roleFromForm: UserRole, tierFromForm?: CustomerTier, nameFromForm?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    console.log("AuthContext: Subscribing to onAuthStateChanged.");
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("AuthContext: onAuthStateChanged triggered. Firebase user UID:", fbUser?.uid || "null");
      setFirebaseUser(fbUser);
      setIsLoading(true); // Set loading true while processing

      if (fbUser) {
        let tokenResult;
        try {
          console.log(`AuthContext: Forcing ID token refresh for UID: ${fbUser.uid}`);
          tokenResult = await fbUser.getIdTokenResult(true); // FORCE REFRESH
          console.log(`AuthContext: Firebase ID token ALL claims for UID ${fbUser.uid}:`, tokenResult.claims);
        } catch (tokenError) {
          console.error(`AuthContext: Error refreshing ID token for UID ${fbUser.uid}:`, tokenError);
          setUser(null); // Can't trust auth state without a valid token
          setIsLoading(false);
          return;
        }

        let determinedRole: UserRole | undefined = undefined;
        let roleSource = "form/default"; // Default source

        if (tokenResult.claims.role && ['admin', 'owner', 'driver', 'customer'].includes(tokenResult.claims.role as string)) {
          determinedRole = tokenResult.claims.role as UserRole;
          roleSource = "custom claim";
          console.log(`AuthContext: Role for UID ${fbUser.uid} determined from custom claim: ${determinedRole}`);
        }

        const userDocRef = doc(db, 'users', fbUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const firestoreUser = userDocSnap.data() as User;
            console.log(`AuthContext: Firestore profile found for UID ${fbUser.uid}:`, firestoreUser);
            
            if (!determinedRole) { // If no custom claim, use Firestore role
              determinedRole = firestoreUser.role;
              roleSource = "Firestore document";
              console.log(`AuthContext: Role for UID ${fbUser.uid} determined from Firestore document: ${determinedRole}`);
            } else if (determinedRole !== firestoreUser.role && roleSource === "custom claim") {
              console.warn(`AuthContext: Role mismatch for UID ${fbUser.uid}. Custom Claim: '${determinedRole}', Firestore Role: '${firestoreUser.role}'. Prioritizing Custom Claim for session role.`);
            }

            const appUser: User = {
              ...firestoreUser,
              id: fbUser.uid,
              role: determinedRole || 'customer',
              email: fbUser.email || firestoreUser.email || 'unknown@example.com',
              name: firestoreUser.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              avatarUrl: firestoreUser.avatarUrl || fbUser.photoURL || `https://source.unsplash.com/100x100/?profile,${determinedRole || 'user'}`,
            };
            if (appUser.role === 'customer' && firestoreUser.tier) {
                appUser.tier = firestoreUser.tier;
            } else if (appUser.role !== 'customer') {
                delete appUser.tier; 
            }
            console.log(`AuthContext: Final appUser object for UID ${fbUser.uid} (Role source: ${roleSource}):`, appUser);
            setUser(appUser);
          } else {
            console.warn(`AuthContext: No Firestore profile found for UID ${fbUser.uid}. This could be a first login or profile creation pending via loginWithFirebase.`);
            if (determinedRole) {
              const preliminaryUser: User = {
                id: fbUser.uid,
                email: fbUser.email || 'unknown@example.com',
                name: fbUser.displayName || fbUser.email?.split('@')[0] || `User (${roleSource})`,
                role: determinedRole,
                avatarUrl: fbUser.photoURL || `https://source.unsplash.com/100x100/?profile,${determinedRole}`,
              };
              console.log(`AuthContext: Setting preliminary user for UID ${fbUser.uid} based on role from ${roleSource}:`, preliminaryUser);
              setUser(preliminaryUser);
            } else {
              console.error(`AuthContext: CRITICAL - UID ${fbUser.uid} has no Firestore profile and no valid 'role' custom claim. User state will be null.`);
              setUser(null);
            }
          }
        } catch (firestoreError: any) {
          console.error(`AuthContext: Error processing auth state or fetching Firestore profile for UID: "${fbUser.uid}"`, firestoreError);
          if (determinedRole) {
            console.warn(`AuthContext: Firestore profile fetch failed for UID ${fbUser.uid} but custom claim role '${determinedRole}' exists. Proceeding with minimal user object.`);
            const minimalUser: User = {
              id: fbUser.uid,
              email: fbUser.email || 'unknown@example.com',
              name: fbUser.displayName || fbUser.email?.split('@')[0] || `User (Claim Only)`,
              role: determinedRole,
              avatarUrl: fbUser.photoURL || `https://source.unsplash.com/100x100/?profile,${determinedRole}`,
            };
            setUser(minimalUser);
          } else {
            setUser(null);
          }
        }
      } else {
        console.log("AuthContext: No Firebase user (logged out state).");
        setUser(null);
        setFirebaseUser(null);
      }
      setIsLoading(false);
      console.log("AuthContext: setIsLoading(false) in onAuthStateChanged.");
    });

    return () => {
      console.log("AuthContext: Unsubscribing from onAuthStateChanged.");
      unsubscribe();
    }
  }, []);

  const loginWithFirebase = async (fbUser: FirebaseUser, roleFromForm: UserRole, tierFromForm?: CustomerTier, nameFromForm?: string) => {
    setIsLoading(true);
    console.log("AuthContext: loginWithFirebase called for UID:", fbUser.uid, "with roleFromForm:", roleFromForm, "tierFromForm:", tierFromForm, "nameFromForm:", nameFromForm);
    
    let tokenResult;
    try {
      console.log("AuthContext: loginWithFirebase - Forcing ID token refresh for UID:", fbUser.uid);
      tokenResult = await fbUser.getIdTokenResult(true);
      console.log(`AuthContext: loginWithFirebase - Fresh ID token ALL claims for UID ${fbUser.uid}:`, tokenResult.claims);
    } catch (tokenError) {
      console.error(`AuthContext: loginWithFirebase - Error refreshing ID token for UID ${fbUser.uid}:`, tokenError);
      setUser(null);
      setIsLoading(false);
      return;
    }

    let sessionRole: UserRole = roleFromForm; 
    let roleSource = "form";

    if (tokenResult.claims.role && ['admin', 'owner', 'driver', 'customer'].includes(tokenResult.claims.role as string)) {
      sessionRole = tokenResult.claims.role as UserRole;
      roleSource = "custom claim";
      console.log(`AuthContext: loginWithFirebase - Role for session for UID ${fbUser.uid} determined from custom claim: ${sessionRole}`);
    } else {
      console.log(`AuthContext: loginWithFirebase - No overriding custom claim for role for UID ${fbUser.uid}. Session role based on form: ${sessionRole}`);
    }

    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef).catch(e => {
        console.error(`AuthContext: loginWithFirebase - Firestore getDoc failed for UID ${fbUser.uid} (might be a new user or rules issue):`, e);
        return null;
    });

    let appUserToSet: User;
    const currentTimestamp = serverTimestamp();
    const resolvedName = nameFromForm || fbUser.displayName || fbUser.email?.split('@')[0] || 'User';

    try {
      if (userDocSnap && userDocSnap.exists()) {
        const firestoreUser = userDocSnap.data() as User;
        console.log(`AuthContext: loginWithFirebase - Firestore profile exists for UID ${fbUser.uid}:`, firestoreUser);
        
        const updates: Partial<User> & { updatedAt: FieldValue, tier?: CustomerTier | FieldValue } = { 
          updatedAt: currentTimestamp,
        };
        
        if (resolvedName && resolvedName !== firestoreUser.name) {
            updates.name = resolvedName;
        }

        if (roleSource === "form" && sessionRole !== firestoreUser.role) {
          updates.role = sessionRole;
          console.log(`AuthContext: loginWithFirebase - Updating Firestore role to '${sessionRole}' as no custom claim present and form role differs for UID ${fbUser.uid}.`);
        }
        
        if (sessionRole === 'customer') {
          const newTier = tierFromForm || firestoreUser.tier || 'standard';
          if (newTier !== firestoreUser.tier) {
            updates.tier = newTier;
          }
        } else { 
          if (firestoreUser.tier !== undefined) { 
            // ✅ FIX: Cast the 'updates' object to 'any' to allow assigning a FieldValue
            (updates as any).tier = deleteField(); 
            console.log(`AuthContext: loginWithFirebase - Removing tier for non-customer role UID ${fbUser.uid}.`);
          }
        }

        if (Object.keys(updates).length > 1 || (Object.keys(updates).length === 1 && !updates.updatedAt)) {
            await setDoc(userDocRef, updates, { merge: true });
            console.log(`AuthContext: loginWithFirebase - Merged updates to existing Firestore profile for UID ${fbUser.uid}:`, updates);
        } else {
            await setDoc(userDocRef, { updatedAt: currentTimestamp }, { merge: true }); 
            console.log(`AuthContext: loginWithFirebase - Only updatedAt was merged for UID ${fbUser.uid}.`);
        }

        appUserToSet = {
          ...firestoreUser, 
          ...updates,
          id: fbUser.uid,
          role: sessionRole, 
          email: fbUser.email || firestoreUser.email || 'unknown@example.com',
          name: updates.name || firestoreUser.name || resolvedName,
          avatarUrl: firestoreUser.avatarUrl || fbUser.photoURL || `https://source.unsplash.com/100x100/?profile,${sessionRole}`,
        };
        
        if (sessionRole !== 'customer') {
            delete appUserToSet.tier;
        } else if (sessionRole === 'customer') {
            appUserToSet.tier = (updates.tier && typeof updates.tier !== 'function' ? updates.tier : firestoreUser.tier) as CustomerTier | undefined;
            if (appUserToSet.tier === undefined) appUserToSet.tier = 'standard';
        }
        console.log(`AuthContext: loginWithFirebase - Updated appUser from existing profile for UID ${fbUser.uid}:`, appUserToSet);

      } else {
        console.log(`AuthContext: loginWithFirebase - Firestore profile DOES NOT exist (or failed to fetch) for UID ${fbUser.uid}. Creating one...`);
        const newUserProfileData: User = {
          id: fbUser.uid,
          email: fbUser.email || `temp-${Date.now()}@example.com`,
          name: resolvedName,
          role: sessionRole,
          avatarUrl: fbUser.photoURL || `https://source.unsplash.com/100x100/?profile,${sessionRole}`,
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
        };
        if (sessionRole === 'customer') {
          newUserProfileData.tier = tierFromForm || 'standard';
        }
        
        console.log(`AuthContext: loginWithFirebase - Data to be saved to Firestore for new user UID ${fbUser.uid}:`, newUserProfileData);
        await setDoc(userDocRef, newUserProfileData);
        console.log(`AuthContext: loginWithFirebase - Successfully created new Firestore profile for UID ${fbUser.uid}.`);
        
        appUserToSet = newUserProfileData;
        console.log(`AuthContext: loginWithFirebase - appUser for context after new profile creation for UID ${fbUser.uid}:`, appUserToSet);
      }
      
      setUser(appUserToSet);
      console.log(`AuthContext: loginWithFirebase - User state set in AuthContext for UID ${fbUser.uid}. Navigating to dashboard.`);
      router.push('/dashboard');

    } catch (error) {
      console.error(`AuthContext: Error in loginWithFirebase (Firestore interaction) for UID: "${fbUser?.uid}"`, error);
      if (sessionRole) { 
        const minimalUser: User = {
            id: fbUser.uid,
            email: fbUser.email || 'unknown@example.com',
            name: resolvedName,
            role: sessionRole,
            avatarUrl: fbUser.photoURL || `https://source.unsplash.com/100x100/?profile,${sessionRole}`,
        };
        if (sessionRole === 'customer') minimalUser.tier = tierFromForm || 'standard';
        setUser(minimalUser);
        console.warn(`AuthContext: loginWithFirebase - Firestore operation failed but using minimal user based on role: ${sessionRole}`);
        router.push('/dashboard');
      } else {
        setUser(null); 
      }
    } finally {
      setIsLoading(false);
      console.log("AuthContext: loginWithFirebase - setIsLoading(false).");
    }
  };

  const logout = async () => {
    setIsLoading(true);
    console.log("AuthContext: logout called.");
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      console.log("AuthContext: Firebase sign out successful. User state cleared.");
      router.push('/login');
    } catch (error) {
      console.error("AuthContext: Error signing out:", error);
    } finally {
      setIsLoading(false);
      console.log("AuthContext: logout - setIsLoading(false).");
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loginWithFirebase, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
