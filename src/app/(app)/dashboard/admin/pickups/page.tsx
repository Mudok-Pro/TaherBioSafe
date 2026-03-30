
'use client';

import type { PickupOrder, PickupStatus, User } from '@/types';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PICKUP_STATUSES, WASTE_TYPES } from '@/lib/constants';
import { MoreHorizontal, Truck, CheckCircle, XCircle, CalendarClock, Loader2, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp, Timestamp, type FieldValue, where } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle as ShadAlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';

export default function AdminPickupsPage() {
  const [pickups, setPickups] = useState<PickupOrder[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: adminUser, isLoading: authIsLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const tr = t as (key: string, params?: Record<string, any>) => string;

  const fetchPickupsAndDrivers = useCallback(async () => {
    if (authIsLoading) {
      setIsLoading(true);
      return;
    }
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'owner')) {
      const permissionErrorMsg = tr('pickupManagementNoPermissionError');
      setError(permissionErrorMsg);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [pickupsSnapshot, driversSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'pickups'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'driver')))
      ]);

      const fetchedPickups: PickupOrder[] = [];
      pickupsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const preferredDate = data.preferredDate instanceof Timestamp ? data.preferredDate : Timestamp.fromDate(new Date(data.preferredDate as any));
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.fromDate(new Date(data.createdAt as any));
        let actualPickupDate: Timestamp | undefined = undefined;
        if (data.actualPickupDate) {
          actualPickupDate = data.actualPickupDate instanceof Timestamp ? data.actualPickupDate : Timestamp.fromDate(new Date(data.actualPickupDate as any));
        }
        let updatedAt: Timestamp | undefined = undefined;
        if (data.updatedAt) {
            updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.fromDate(new Date(data.updatedAt as any));
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
      setPickups(fetchedPickups);

      const fetchedDrivers: User[] = [];
      driversSnapshot.forEach((docSnap) => {
        fetchedDrivers.push({ id: docSnap.id, ...docSnap.data() } as User);
      });
      setDrivers(fetchedDrivers);

      console.log(`AdminPickupsPage: Successfully fetched ${fetchedPickups.length} pickups and ${fetchedDrivers.length} drivers.`);
    } catch (e: any) {
      console.error("AdminPickupsPage: Error fetching data from Firestore:", e);
      const errorDetails = e.code === 'failed-precondition' 
        ? `${e.message} - This likely means you need to create a Firestore index for querying users by role. Please check the browser console for a link to create it.`
        : `${e.message} (Code: ${e.code || 'N/A'})`;
      const errorMsg = tr('pickupManagementFetchError', { errorDetails });
      setError(errorMsg);
      toast({ title: tr('pickupManagementFetchErrorTitle'), description: errorMsg, variant: 'destructive', duration: 9000 });
    } finally {
      setIsLoading(false);
    }
  }, [adminUser, authIsLoading, t, toast]);

  useEffect(() => {
    if (!authIsLoading && adminUser) {
      fetchPickupsAndDrivers();
    } else if (!authIsLoading && !adminUser) {
        setError(tr('userNotLoggedInError'));
        setIsLoading(false);
    }
  }, [authIsLoading, adminUser, fetchPickupsAndDrivers]);

  const getStatusInfo = (statusValue: PickupOrder['status']) => {
    const statusDetails = PICKUP_STATUSES.find(s => s.value === statusValue);
    const fallback = { labelKey: 'unknownStatus' as any, color: 'bg-gray-400' };
    const finalDetails = statusDetails || fallback;
    const labelKey = finalDetails.labelKey || fallback.labelKey;
    return { ...finalDetails, label: tr(labelKey) };
  };

  const getWasteTypeInfo = (wasteTypeValue: PickupOrder['wasteType']) => {
    const type = WASTE_TYPES.find(w => w.value === wasteTypeValue);
    return { label: type?.label ? tr(type.label as any) : tr('unknownStatus'), icon: type?.icon || Truck };
  };
  
  const updatePickupInFirestore = async (pickupId: string, updates: Partial<PickupOrder>) => {
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'owner')) {
      toast({ title: tr('pickupManagementActionErrorTitle'), description: tr('pickupManagementNoPermissionError'), variant: "destructive" });
      return false;
    }
    try {
      const pickupDocRef = doc(db, 'pickups', pickupId);
      const dataToUpdate: Partial<PickupOrder> & { updatedAt: FieldValue } = {
          ...updates,
          updatedAt: serverTimestamp()
      };
      await updateDoc(pickupDocRef, dataToUpdate as any);
      return true;
    } catch (e: any) {
      console.error(`AdminPickupsPage: Error updating pickup ${pickupId}:`, e);
      toast({ title: tr('pickupManagementUpdateErrorTitle'), description: `${tr('pickupManagementErrorPrefix')} ${e.message} (Code: ${e.code || 'N/A'})`, variant: "destructive" });
      return false;
    }
  };

  const handleAssignDriver = async (pickupId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) {
      toast({ title: "Error", description: "Selected driver could not be found.", variant: "destructive" });
      return;
    }
    const currentPickup = pickups.find(p => p.id === pickupId);
    const newStatus = currentPickup?.status === 'requested' ? 'scheduled' : currentPickup?.status;

    const success = await updatePickupInFirestore(pickupId, { 
      driverId, 
      driverName: driver.name,
      status: newStatus 
    });
    if (success) {
      toast({ title: tr('pickupDriverAssignedTitle'), description: tr('pickupDriverAssignedDesc', { pickupId, driverName: driver.name }) });
      fetchPickupsAndDrivers(); 
    }
  };

  const handleUpdateStatus = async (pickupId: string, status: PickupStatus) => {
    const updates: Partial<PickupOrder> = { status };
    const currentPickup = pickups.find(p => p.id === pickupId);
    if (status === 'completed' && !(currentPickup?.actualPickupDate) ) {
      updates.actualPickupDate = Timestamp.now();
    }
    const success = await updatePickupInFirestore(pickupId, updates);
      if (success) {
        toast({ title: tr('pickupStatusUpdatedTitle'), description: tr('pickupStatusUpdatedDesc', { pickupId, status: getStatusInfo(status).label }) });
        fetchPickupsAndDrivers(); 
      }
  };

  if (authIsLoading || (isLoading && !adminUser && !error)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">{tr('loadingAppName')}</p>
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

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">{tr('pickupLogisticsTitle')}</CardTitle>
          <CardDescription>{tr('pickupLogisticsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && pickups.length === 0 && adminUser ? ( 
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">{tr('pickupManagementLoadingPickups')}</p>
              </div>
          ) : !isLoading && pickups.length === 0 && adminUser ? ( 
            <div className="py-10 text-center text-muted-foreground">
              <p className="text-lg">{tr('noPickupsFound')}</p>
              <p>{tr('pickupManagementNoPickupsFirestoreCheck', { adminEmail: adminUser?.email || tr('formPlaceholderEmail') })}</p>
            </div>
          ) : pickups.length > 0 ? ( 
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tr('pickupTableHeadId')}</TableHead>
                  <TableHead>{tr('pickupTableHeadCustomer')}</TableHead>
                  <TableHead>{tr('pickupTableHeadWasteType')}</TableHead>
                  <TableHead>{tr('pickupTableHeadPreferredDate')}</TableHead>
                  <TableHead>{tr('pickupTableHeadStatus')}</TableHead>
                  <TableHead>{tr('pickupTableHeadDriver')}</TableHead>
                  <TableHead className="text-right">{tr('pickupTableHeadActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pickups.map((pickup) => {
                  const statusInfo = getStatusInfo(pickup.status);
                  const wasteTypeInfo = getWasteTypeInfo(pickup.wasteType);
                  const assignedDriver = drivers.find(d => d.id === pickup.driverId);
                  return (
                    <TableRow key={pickup.id}>
                      <TableCell className="font-medium">{pickup.id.substring(0,8)}...</TableCell>
                      <TableCell>{pickup.customerName || pickup.customerId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <wasteTypeInfo.icon className="h-4 w-4 text-muted-foreground" />
                          {wasteTypeInfo.label}
                        </div>
                      </TableCell>
                      <TableCell>{pickup.preferredDate ? format(pickup.preferredDate.toDate(), "PPP") : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                          {(pickup.status === 'requested' || pickup.status === 'scheduled') && !pickup.driverId ? (
                              <Select 
                                value={pickup.driverId || ""} 
                                onValueChange={(driverId) => handleAssignDriver(pickup.id, driverId)}
                                disabled={drivers.length === 0}
                              >
                                <SelectTrigger className="h-8 w-[150px]">
                                    <SelectValue placeholder={drivers.length === 0 ? tr('noDriversFound') : tr('pickupTableAssignDriverPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                          ) : (pickup.driverName || assignedDriver?.name || tr('unassignedLabel'))}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{tr('pickupTableHeadActions')}</DropdownMenuLabel>
                            <DropdownMenuItem><CalendarClock className="mr-2 h-4 w-4" /> {tr('pickupTableActionViewDetails')}</DropdownMenuItem>
                            {pickup.status === 'requested' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(pickup.id, 'scheduled')}>
                                  <CheckCircle className="mr-2 h-4 w-4" /> {tr('pickupTableActionSchedule')}
                              </DropdownMenuItem>
                            )}
                            {pickup.status === 'scheduled' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(pickup.id, 'completed')}>
                                  <Truck className="mr-2 h-4 w-4" /> {tr('pickupTableActionMarkCompleted')}
                              </DropdownMenuItem>
                            )}
                            {pickup.status !== 'completed' && pickup.status !== 'cancelled' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(pickup.id, 'cancelled')}>
                                  <XCircle className="mr-2 h-4 w-4" /> {tr('pickupTableActionCancel')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                              {tr('pickupTableActionDelete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
