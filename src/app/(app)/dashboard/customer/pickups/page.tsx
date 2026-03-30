import { PickupOrderForm } from '@/components/customer/pickup-order-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export default function OrderPickupPage() {
  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 mb-4">
            <Truck className="h-6 w-6 text-accent" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Order Waste Pickup</CardTitle>
          <CardDescription>Schedule a pickup for your waste materials. Please provide accurate details for efficient service.</CardDescription>
        </CardHeader>
        <CardContent>
          <PickupOrderForm />
        </CardContent>
      </Card>
    </div>
  );
}
