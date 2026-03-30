
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { CUSTOMER_TIERS } from '@/lib/constants';
import type { CustomerTier } from '@/types';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Send, Building, User, Phone, Mail, FileSignature, Loader2, Pin, Briefcase } from 'lucide-react';

const formSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
  address: z.string().min(5, { message: 'Full address must be at least 5 characters.' }),
  city: z.string().min(2, { message: 'City must be at least 2 characters.' }),
  contactPerson: z.string().min(2, { message: 'Contact person name must be at least 2 characters.' }),
  contactTitle: z.string().min(2, { message: 'Contact person title must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }).optional(),
  serviceDescription: z.string().min(10, { message: 'Service description must be at least 10 characters.' }).max(500, { message: 'Service description cannot exceed 500 characters.' }),
  requestedTier: z.custom<CustomerTier>(val => CUSTOMER_TIERS.map(t => t.value).includes(val as CustomerTier), {
    message: "Invalid tier selected."
  }),
  customerSignature: z.string().min(2, { message: "Please type your full name as a digital signature."}), // Placeholder for digital signature
  agreedToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms and conditions." }),
});

export function ContractRequestForm() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      address: '',
      city: '',
      contactPerson: user?.name || '',
      contactTitle: '',
      email: user?.email || '',
      phone: '',
      serviceDescription: '',
      requestedTier: 'standard',
      customerSignature: '',
      agreedToTerms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firebaseUser) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to submit a request.', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const idToken = await firebaseUser.getIdToken(true); // ✅ Force refresh the token
      console.log("Token from Firebase Auth:", idToken); // ✅ Log the token
      
      console.log("Sending request with token:", idToken); // ✅ Log token before sending

      const response = await fetch('/api/contracts/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`, // ✅ Send the fresh token
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Read response as text to avoid JSON parsing error
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();

      toast({
        title: 'Contract Request Submitted',
        description: 'Your request has been sent. We will contact you soon.',
        variant: 'default',
      });
      
      form.reset();
      router.push('/dashboard/customer/contracts');

    } catch (error: any) {
      console.error("Error submitting contract request:", error);
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
           <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl><Input placeholder="Your Company Inc." {...field} className="pl-10" /></FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Address</FormLabel>
                <div className="relative">
                  <Pin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl><Input placeholder="123 Main Street" {...field} className="pl-10" /></FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid md:grid-cols-2 gap-6">
           <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <div className="relative">
                  <Pin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl><Input placeholder="Algiers" {...field} className="pl-10" /></FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person (Representative)</FormLabel>
                 <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl><Input placeholder="John Doe" {...field} className="pl-10" /></FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid md:grid-cols-2 gap-6">
           <FormField
            control={form.control}
            name="contactTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person's Title</FormLabel>
                 <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl><Input placeholder="Manager, Director, etc." {...field} className="pl-10" /></FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl><Input type="email" placeholder="contact@company.com" {...field} className="pl-10" /></FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl><Input type="tel" placeholder="(123) 456-7890" {...field} className="pl-10" /></FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the services you require (e.g., weekly pickup of biohazard waste, specific chemical disposal needs)"
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Please provide as much detail as possible. This will be used as the '[Client.Activity.Type]' in the contract.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requestedTier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requested Service Tier</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service tier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CUSTOMER_TIERS.map(tier => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="customerSignature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Digital Signature</FormLabel>
              <div className="relative">
                <FileSignature className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl><Input placeholder="Type your full name" {...field} className="pl-10" /></FormControl>
              </div>
              <FormDescription>
                By typing your full name, you agree this constitutes your legal signature.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agreedToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to the <a href="/terms" target="_blank" className="underline text-primary hover:text-accent">terms and conditions</a> of service.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </Form>
  );
}
