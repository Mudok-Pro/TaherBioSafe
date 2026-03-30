'use client';

import type { PickupOrder, PickupStatus, User } from '@/types';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PICKUP_STATUSES, WASTE_TYPES } from '@/lib/constants';
import { MoreHorizontal, Truck, CheckCircle, XCircle, CalendarClock, Loader2, AlertTriangle, MapPin, Phone, Package, Clock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp, Timestamp, type FieldValue, where } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle as ShadAlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';

export default function DriverSchedulePage() {
  const [schedule, setSchedule] = useState<PickupOrder[]>([]);
  const [isPageDataLoading, setIsPageDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authIsLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  // ✅ FIX: Create a type-safe helper for the translation function
  const tr = t as (key: string, params?: Record<string, any>) => string;

  const fetchDriverSchedule = useCallback(async () => {
    console.log("DriverSchedulePage: fetchDriverSchedule triggered. Auth loading:", authIsLoading, "User from context:", user ? { id: user.id, role: user.role, email: user.email } : null);
    
    if (authIsLoading) {
      setIsPageDataLoading(true); 
      return;
    }

    if (!user || user.role !== 'driver' || !user.id) {
      const accessDeniedMsg = tr('driverScheduleAccessDenied');
      console.warn("DriverSchedulePage: Access denied or user/role not driver. User role:", user?.role, "User ID:", user?.id);
      setError(accessDeniedMsg);
      setSchedule([]);
      setIsPageDataLoading(false);
      return;
    }

    setIsPageDataLoading(true);
    setError(null);
    console.log(`DriverSchedulePage: Attempting to fetch schedule for driver ID: ${user.id}, Role: ${user.role}`);

    try {
      const pickupsCollectionRef = collection(db, 'pickups');
      const q = query(
        pickupsCollectionRef,
        where('driverId', '==', user.id),
        where('status', '==', 'scheduled'),
        orderBy('preferredDate', 'asc')
      );
      console.log("DriverSchedulePage: Firestore query object:", q);

      const querySnapshot = await getDocs(q);
      const fetchedPickups: PickupOrder[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const preferredDate = data.preferredDate instanceof Timestamp ? data.preferredDate : Timestamp.fromDate(new Date(data.preferredDate as any));
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.fromDate(new Date(data.createdAt as any));
        let actualPickupDate: Timestamp | undefined = undefined;
        if (data.actualPickupDate) {
          actualPickupDate = data.actualPickupDate instanceof Timestamp ? data.actualPickupDate : Timestamp.fromDate(new Date(data.actualPickupDate as any));
        }
        let updatedAt: Timestamp | FieldValue | undefined = undefined;
        if (data.updatedAt instanceof Timestamp) {
            updatedAt = data.updatedAt;
        } else if (data.updatedAt && typeof data.updatedAt.seconds === 'number') {
            updatedAt = new Timestamp(data.updatedAt.seconds, data.updatedAt.nanoseconds);
        }

        fetchedPickups.push({
          id: docSnap.id,
          ...data,
          preferredDate,
          actualPickupDate,
          createdAt,
          updatedAt,
        } as PickupOrder);
      });
      
      setSchedule(fetchedPickups);
      console.log(`DriverSchedulePage: Schedule query successful. ${querySnapshot.size} pickups found for driver ${user.id}.`);
    } catch (e: any) {
      console.error(`DriverSchedulePage: Detailed error fetching schedule for driver ${user.id}: Code: ${e.code}, Message: ${e.message}`, e);
      const errorDetails = e.code ? `Code: ${e.code}, Message: ${e.message}` : e.message;
      let indexCreationSuggestion = "";
      if (e.code === 'failed-precondition' && e.message && e.message.toLowerCase().includes('index')) {
          indexCreationSuggestion = tr('firestoreIndexSuggestion');
      }
      const specificErrorMsg = tr('driverScheduleFetchError', { errorDetails: `${errorDetails}${indexCreationSuggestion}` });
      setError(specificErrorMsg);
      toast({
        title: tr('driverScheduleFetchErrorTitle'),
        description: specificErrorMsg,
        variant: "destructive",
        duration: 9000,
      });
    } finally {
      setIsPageDataLoading(false);
      console.log("DriverSchedulePage: fetchDriverSchedule finished.");
    }
  }, [user, authIsLoading, tr, toast]);

  useEffect(() => {
    if (!authIsLoading && user) { 
      if (user.role === 'driver') {
        fetchDriverSchedule();
      } else {
        setError(tr('driverScheduleAccessDenied'));
        setIsPageDataLoading(false);
      }
    } else if (!authIsLoading && !user) {
      setError(tr('userNotLoggedInError'));
      setIsPageDataLoading(false);
    }
  }, [authIsLoading, user, fetchDriverSchedule, tr]);

  const getStatusInfo = (statusValue: PickupOrder['status']) => {
    const statusDetails = PICKUP_STATUSES.find(s => s.value === statusValue);
    const fallback = { labelKey: 'unknownStatus' as any, label: 'Unknown', color: 'bg-gray-400' };
    const finalDetails = statusDetails || fallback;
    const labelKey = (finalDetails as any).labelKey || fallback.labelKey;
    return { ...finalDetails, label: tr(labelKey) };
  };

  const getWasteTypeInfo = (wasteTypeValue: PickupOrder['wasteType']) => {
    const typeDetails = WASTE_TYPES.find(w => w.value === wasteTypeValue);
    const fallback = { labelKey: 'unknownStatus' as any, label: 'Unknown', icon: Package };
    const finalDetails = typeDetails || fallback;
    const labelKey = (finalDetails as any).labelKey || fallback.labelKey;
    const label = tr(labelKey);
    return { ...finalDetails, label: label, icon: finalDetails.icon || Package };
  };

  const handleNavigate = (address?: string) => {
    if (!address) {
      console.warn("DriverSchedulePage: Navigation address is not available for this pickup.");
      toast({ title: tr('driverNavigationAddressMissingTitle'), description: tr('driverNavigationAddressMissingDesc'), variant: "destructive" });
      return;
    }
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleUpdatePickupStatus = async (pickupId: string, newStatus: 'completed' | 'cancelled') => {
    if (!user || user.role !== 'driver') {
      toast({ title: tr('pickupManagementActionErrorTitle'), description: tr('pickupManagementNoPermissionError'), variant: "destructive" });
      return;
    }
    console.log(`DriverSchedulePage: Driver ${user.id} attempting to update pickup ${pickupId} to ${newStatus}`);
    try {
      const pickupDocRef = doc(db, 'pickups', pickupId);
      const updates: Partial<PickupOrder> & {updatedAt: FieldValue} = { 
        status: newStatus,
        updatedAt: serverTimestamp()
      };
      if (newStatus === 'completed') {
        updates.actualPickupDate = Timestamp.now();
      }
      await updateDoc(pickupDocRef, updates as any);
      toast({ title: tr('pickupStatusUpdatedTitle'), description: tr('pickupStatusUpdatedDesc', { pickupId, status: getStatusInfo(newStatus).label }) });
      fetchDriverSchedule();
    } catch (error: any) {
      console.error(`DriverSchedulePage: Error updating pickup ${pickupId} status by driver ${user.id}:`, error);
      toast({ title: tr('pickupManagementUpdateErrorTitle'), description: `${tr('pickupManagementErrorPrefix')} ${error.message} (Code: ${error.code || 'N/A'})`, variant: "destructive" });
    }
  };


  if (authIsLoading || (isPageDataLoading && !user && !error)) { 
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">{tr('driverScheduleLoading')}</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto my-8">
        <AlertTriangle className="h-4 w-4" />
        <ShadAlertTitle>{tr('errorDialogTitle')}</ShadAlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!authIsLoading && user && user.role !== 'driver' && !isPageDataLoading) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto my-8">
        <AlertTriangle className="h-4 w-4" />
        <ShadAlertTitle>{tr('errorDialogTitle')}</ShadAlertTitle>
        <AlertDescription>{tr('driverScheduleAccessDenied')}</AlertDescription>
      </Alert>
    );
  }
  
  if (!isPageDataLoading && !error && user && user.role === 'driver' && schedule.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center">
            <Truck className="mr-2 h-6 w-6" /> {tr('driverScheduleTitle')}
          </CardTitle>
          <CardDescription>{tr('driverScheduleDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="py-10 text-center text-muted-foreground">
          <p className="text-lg">{tr('driverScheduleNoPickups')}</p>
          <p>{tr('driverScheduleNoPickupsSub')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center">
            <Truck className="mr-2 h-6 w-6" /> {tr('driverScheduleTitle')}
          </CardTitle>
          <CardDescription>{tr('driverScheduleDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {schedule.length > 0 ? (
            <div className="space-y-4">
            {schedule.map((pickup) => {
              const statusInfo = getStatusInfo(pickup.status);
              const wasteTypeInfo = getWasteTypeInfo(pickup.wasteType);
              const pickupAddress = pickup.address || tr('addressNotAvailable'); 
              return (
                <Card key={pickup.id} className="bg-secondary/30 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg text-primary">{pickup.customerName || pickup.customerId}</CardTitle>
                            <CardDescription className="flex items-center"><MapPin className="mr-1 h-3 w-3 text-muted-foreground" /> {pickupAddress}</CardDescription>
                        </div>
                        <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" /> 
                        {pickup.preferredDate ? format(pickup.preferredDate.toDate(), "PPP") : 'N/A'}
                    </div>
                      <div className="flex items-center text-sm">
                        <wasteTypeInfo.icon className="mr-2 h-4 w-4 text-muted-foreground" /> 
                        {wasteTypeInfo.label} ({pickup.quantity || 'N/A'})
                    </div>
                    {pickup.notes && (
                        <p className="text-xs text-muted-foreground border-l-2 border-primary pl-2 italic">{pickup.notes}</p>
                    )}
                    <div className="pt-2 space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                          onClick={() => handleNavigate(pickup.address)}
                          disabled={!pickup.address}
                        >
                          <MapPin className="mr-2 h-4 w-4" /> Navigate
                        </Button>
                        <Button variant="outline" size="sm" disabled> 
                          <Phone className="mr-2 h-4 w-4" /> Contact
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleUpdatePickupStatus(pickup.id, 'completed')}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
