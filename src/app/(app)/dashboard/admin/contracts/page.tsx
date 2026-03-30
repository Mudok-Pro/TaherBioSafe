
'use client';

import type { Contract, ContractStatus } from '@/types';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CONTRACT_STATUSES } from '@/lib/constants';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2, Archive, FileSignature, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle as ShadAlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp, Timestamp, limit, type FieldValue } from 'firebase/firestore';
import { useLanguage } from '@/context/language-context';
import { ApproveContractButton } from '@/components/admin/ApproveContractButton';
import type { TranslationKey } from '@/lib/translations';

const TABS: { value: ContractStatus | 'all'; labelKey: keyof typeof import('@/lib/translations').translations.en }[] = [
  { value: 'all', labelKey: 'contractTableTabAll' },
  { value: 'requested', labelKey: 'contractTableTabPending' },
  { value: 'failed', labelKey: 'failed' as any },
  { value: 'awaiting_signatures', labelKey: 'contractTableTabAwaitingSignatures' },
  { value: 'active', labelKey: 'contractTableTabActive' },
  { value: 'expired', labelKey: 'contractTableTabExpired' },
  { value: 'archived', labelKey: 'contractTableTabArchived' },
];

function formatDate(date: Timestamp | string | undefined | null): string {
  if (!date) return 'N/A';
  try {
    const jsDate = date instanceof Timestamp ? date.toDate() : new Date(date);
    if (isNaN(jsDate.getTime())) return 'Invalid date';
    return jsDate.toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
}

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeTab, setActiveTab] = useState<ContractStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: adminUser, isLoading: authIsLoading } = useAuth();
  const { t } = useLanguage();
  const tr = t as (key: string, params?: Record<string, any>) => string;

  const fetchContracts = useCallback(async () => {
    if (authIsLoading || !adminUser) return;
    if (adminUser.role !== 'admin' && adminUser.role !== 'owner') {
      setError(tr('contractManagementPermissionErrorAdminStrict'));
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const contractsCollectionRef = collection(db, 'contracts');
      const q = query(contractsCollectionRef, orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const fetchedContracts: Contract[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data || typeof data !== 'object') return;

        fetchedContracts.push({
          id: docSnap.id,
          ...data,
          requestedDate: data.requestedDate ?? null,
          startDate: data.startDate ?? null,
          endDate: data.endDate ?? null,
          createdAt: data.createdAt ?? null,
        } as Contract);
      });
      setContracts(fetchedContracts);
    } catch (e: any) {
      console.error("Error fetching contracts:", e);
      setError(tr('contractManagementFetchErrorAdminStrict', { errorDetails: e.message }));
    } finally {
      setIsLoading(false);
    }
  }, [adminUser, authIsLoading, tr]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleApprovalSuccess = (approvedContractId: string) => {
    setContracts(currentContracts =>
      currentContracts.map(c =>
        c.id === approvedContractId ? { ...c, status: 'approving' } : c
      )
    );
    setTimeout(() => fetchContracts(), 1500);
  };

  const filteredContracts = useMemo(() => {
    return activeTab === 'all' ? contracts : contracts.filter(c => c.status === activeTab);
  }, [activeTab, contracts]);

  const getStatusInfo = (statusValue: Contract['status']) => {
    const statusDetails = CONTRACT_STATUSES.find(s => s.value === statusValue);
    const fallback = { labelKey: 'unknownStatus' as any, color: 'bg-gray-400' };
    const finalDetails = statusDetails || fallback;
    const labelKey = finalDetails.labelKey || fallback.labelKey;
    return { ...finalDetails, label: tr(labelKey) };
  };

  const renderErrorDetails = (error: any): string | null => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null) {
      return Object.values(error).flat().join('; ');
    }
    return 'An unexpected error occurred.';
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <Alert variant="destructive" className="max-w-xl mx-auto my-8"><AlertTriangle className="h-4 w-4" /><ShadAlertTitle>{tr('errorDialogTitle')}</ShadAlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center">
          <div className="flex-grow">
            <CardTitle className="text-2xl font-bold text-primary">{tr('contractManagementTitle')}</CardTitle>
            <CardDescription>{tr('contractManagementDesc')}</CardDescription>
          </div>
          <Button onClick={() => fetchContracts()} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {tr('refresh')}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContractStatus | 'all')} className="w-full">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 mb-4">
              {TABS.map(tab => <TabsTrigger key={tab.value} value={tab.value}>{tr(tab.labelKey)}</TabsTrigger>)}
            </TabsList>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tr('contractTableHeadId')}</TableHead>
                  <TableHead>{tr('contractTableHeadCustomer')}</TableHead>
                  <TableHead>{tr('contractTableHeadTier')}</TableHead>
                  <TableHead>{tr('contractTableHeadStatus')}</TableHead>
                  <TableHead>{tr('contractTableHeadRequested')}</TableHead>
                  <TableHead className="text-right">{tr('contractTableHeadActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {tr('contractTableEmpty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => {
                    const statusInfo = getStatusInfo(contract.status);

                    return (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.id.substring(0,8)}...</TableCell>
                        <TableCell>{contract.customerName || contract.customerEmail || contract.customerId || 'N/A'}</TableCell>
                        <TableCell className="capitalize">{contract.tier || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
                          {contract.status === 'failed' && contract.lastError && (
                            <div className="text-xs text-red-500 mt-1 max-w-xs break-words">
                              {renderErrorDetails(contract.lastError)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDate(contract.requestedDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          {['requested', 'failed', 'approving'].includes(contract.status) ? (
                            <ApproveContractButton
                              contract={{
                                ...contract,
                                // ✅ FIX: Use the helper function to convert the error object to a string
                                // and then sanitize from null to undefined for type safety.
                                lastError: renderErrorDetails(contract.lastError) ?? undefined
                              }}
                              onSuccess={handleApprovalSuccess}
                            />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">{tr('contractTableActionOpenMenu')}</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{tr('contractTableHeadActions')}</DropdownMenuLabel>
                                <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> {tr('contractTableActionViewDetails')}</DropdownMenuItem>
                                <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> {tr('contractTableActionEdit')}</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                  <Trash2 className="mr-2 h-4 w-4" /> {tr('contractTableActionDelete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
