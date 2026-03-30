import { ContractRequestForm } from '@/components/customer/contract-request-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RequestContractPage() {
  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Request New Service Contract</CardTitle>
          <CardDescription>Fill out the form below to request a new service contract. Our team will review your request and get back to you shortly.</CardDescription>
        </CardHeader>
        <CardContent>
          <ContractRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
