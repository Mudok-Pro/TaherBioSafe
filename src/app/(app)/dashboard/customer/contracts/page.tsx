
'use client';

import type { Contract, ContractStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CONTRACT_STATUSES } from '@/lib/constants';
import Link from 'next/link';
import { Download, Eye, FilePlus2, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle as ShadAlertTitle } from "@/components/ui/alert";
import type { TranslationKey } from '@/lib/translations';

export default function CustomerContractsPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { toast } = useToast();
  const tr = t as (key: string, params?: Record<string, any>) => string;

  const fetchContracts = useCallback(async () => {
    console.log("CustomerContractsPage: useEffect[fetchContracts] triggered. Auth loading:", authIsLoading, "User from context:", user ? { id: user.id, email: user.email } : "null");

    if (authIsLoading) {
      console.log("CustomerContractsPage: Auth is still loading, deferring contract fetch.");
      setIsLoading(true);
      return;
    }

    if (!user || !user.id) {
      const notLoggedInMsg = tr('userNotLoggedInError');
      console.warn("CustomerContractsPage: No authenticated user or user.id found. Cannot fetch contracts.");
      setError(notLoggedInMsg);
      setContracts([]);
      setIsLoading(false);
      return;
    }

    console.log(`CustomerContractsPage: Attempting to fetch contracts for customer ID: ${user.id}, Email: ${user.email}`);
    setIsLoading(true);
    setError(null);

    try {
      const contractsCollectionRef = collection(db, 'contracts');
      const q = query(
        contractsCollectionRef,
        where('customerId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      console.log("CustomerContractsPage: Firestore query object constructed for customer:", user.id, q);

      const querySnapshot = await getDocs(q);
      const fetchedContracts: Contract[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedContracts.push({
          id: docSnap.id,
          ...data,
          requestedDate: data.requestedDate,
          startDate: data.startDate,
          endDate: data.endDate,
          createdAt: data.createdAt,
        } as Contract);
      });
      
      setContracts(fetchedContracts);
      console.log(`CustomerContractsPage: Contracts query successful. ${querySnapshot.size} documents found for customer ${user.id}. Empty: ${querySnapshot.empty}. Contracts:`, fetchedContracts);
      
    } catch (e: any) {
      console.error(`CustomerContractsPage: Detailed error fetching contracts for customer ${user.id}:`, e);
      const errorDetails = e.code ? `Code: ${e.code}, Message: ${e.message}` : e.message;
      let indexCreationSuggestion = "";
      if (e.code === 'failed-precondition' && e.message && e.message.toLowerCase().includes('index')) {
          indexCreationSuggestion = " This query may require a composite index in Firestore. Check the browser console for error details which might include a link to create it.";
      }
      
      const specificErrorMsg = tr('customerFetchError', {
        errorDetails: `${errorDetails}${indexCreationSuggestion}`,
        queryInfo: `where('customerId', '==', '${user.id}') ordered by createdAt desc`
      });
      setError(specificErrorMsg);
      toast({
        title: tr('contractManagementFetchErrorTitle'),
        description: specificErrorMsg,
        variant: "destructive",
        duration: 9000,
      });
    } finally {
      setIsLoading(false);
      console.log("CustomerContractsPage: fetchContracts finished.");
    }
  }, [user, authIsLoading, tr, toast]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);


  const getStatusInfo = (statusValue: Contract['status']) => {
    const statusDetails = CONTRACT_STATUSES.find(s => s.value === statusValue);
    const fallback = { labelKey: 'unknownStatus' as any, color: 'bg-gray-400' };
    const finalDetails = statusDetails || fallback;
    const labelKey = finalDetails.labelKey || fallback.labelKey;
    return { ...finalDetails, label: tr(labelKey) };
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  if (authIsLoading || (isLoading && !user)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">{tr('loadingAppName')}</p>
      </div>
    );
  }
  
  if (error && contracts.length === 0) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto my-8">
        <AlertTriangle className="h-4 w-4" />
        <ShadAlertTitle>{tr('contractManagementFetchErrorTitle')}</ShadAlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">{tr('customerMyContractsTitle')}</CardTitle>
            <CardDescription>{tr('customerMyContractsDesc')}</CardDescription>
          </div>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/dashboard/customer/contracts/request">
              <FilePlus2 className="mr-2 h-4 w-4" />
              {tr('customerRequestNewContractButton')}
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && contracts.length === 0 && !error ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">{tr('contractManagementLoadingContracts')}</p>
              </div>
          ) : !isLoading && contracts.length === 0 && !error ? (
            <div className="py-10 text-center text-muted-foreground">
              <p className="mb-2 text-lg">{tr('customerNoContractsMessage')}</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/customer/contracts/request">{tr('customerRequestFirstContractButton')}</Link>
              </Button>
            </div>
          ) : contracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tr('contractTableHeadId')}</TableHead>
                  <TableHead>{tr('customerContractTableHeadService')}</TableHead>
                  <TableHead>{tr('contractTableHeadStatus')}</TableHead>
                  <TableHead>{tr('contractTableHeadRequested')}</TableHead>
                  <TableHead>{tr('customerContractTableHeadEffectiveDate')}</TableHead>
                  <TableHead className="text-right">{tr('contractTableHeadActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => {
                  const statusInfo = getStatusInfo(contract.status);
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.id.substring(0,8)}...</TableCell>
                      <TableCell className="max-w-xs truncate">{contract.serviceDescription}</TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(contract.requestedDate)}</TableCell>
                      <TableCell>
                        {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" title={tr('customerContractTableActionView')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {contract.documentUrl && (contract.status === 'active' || contract.status === 'expired') && (
                          <Button variant="outline" size="sm" asChild title={tr('customerContractTableActionDownload')}>
                            <a href={contract.documentUrl} download={`${contract.id}_signed.pdf`}>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {contract.status === 'expired' && (
                            <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground" title={tr('customerContractTableActionRenew')}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
        {contracts.length > 0 && (
            <CardFooter className="text-sm text-muted-foreground">
                {tr('customerContractsFooterShowing', { count: contracts.length.toString() })}
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
