
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import type { Contract } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, Send } from 'lucide-react';

interface ApproveContractButtonProps {
  contract: Contract;
  onSuccess: (contractId: string) => void;
}

export function ApproveContractButton({ contract, onSuccess }: ApproveContractButtonProps) {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Determine if the button should be disabled based on contract status or loading state
  const isButtonDisabled =
    isPending ||
    !['requested', 'failed'].includes(contract.status);

  // Dynamically set the button content based on the contract's status
  const getButtonContent = () => {
    if (isPending || contract.status === 'approving') {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Approving...
        </>
      );
    }
    if (contract.status === 'failed') {
      return (
        <>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Retry Approval
        </>
      );
    }
    return (
      <>
        <Send className="mr-2 h-4 w-4" />
        Approve & Send
      </>
    );
  };

  const handleApprove = async () => {
    if (!contract.id) {
      setError('Cannot approve: Contract ID is missing.');
      toast({ title: 'Error', description: 'Contract ID is missing.', variant: 'destructive' });
      return;
    }
    if (!firebaseUser) {
      setError('Cannot approve: User not authenticated.');
      toast({ title: 'Authentication Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const adminToken = await firebaseUser.getIdToken(true);

        const response = await fetch('/api/contracts/approve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ contractId: contract.id }),
        });
        
        const data = await response.json();

        if (!response.ok) {
          // The backend provides a clear error message, which we display to the user.
          throw new Error(data.error || `Request failed with status ${response.status}`);
        }

        // On success (200 OK or 202 Accepted), call the parent's refresh function.
        toast({
          title: "Approval Processed",
          description: data.message || `Approval for contract ${contract.id} has been processed.`,
        });
        onSuccess(contract.id);

      } catch (err: any) {
        console.error('Error approving contract:', err);
        setError(err.message);
        toast({
          title: 'Approval Failed',
          description: err.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        onClick={handleApprove}
        disabled={isButtonDisabled}
        variant={contract.status === 'failed' ? 'destructive' : 'default'}
        size="sm"
        className={contract.status === 'failed' ? '' : "bg-accent text-accent-foreground hover:bg-accent/90"}
      >
        {getButtonContent()}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {contract.status === 'failed' && contract.lastError && (
        <p className="text-xs text-destructive max-w-[150px] truncate" title={contract.lastError}>
          Error: {contract.lastError}
        </p>
      )}
    </div>
  );
}
