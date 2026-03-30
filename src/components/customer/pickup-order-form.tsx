'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { WASTE_TYPES } from '@/lib/constants';
import type { WasteType } from '@/types';
import { format } from "date-fns";
import { Timestamp, addDoc, collection, serverTimestamp, setLogLevel } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Send, Package, StickyNote, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

const formSchema = z.object({
  wasteType: z.custom<WasteType>(val => WASTE_TYPES.map(t => t.value).includes(val as WasteType), {
    message: "Invalid waste type selected."
  }),
  quantity: z.string().min(1, { message: 'Quantity is required (e.g., 10kg, 2 bins).' }),
  preferredDate: z.date({
    required_error: "A preferred pickup date is required.",
  }),
  notes: z.string().max(300, { message: 'Notes cannot exceed 300 characters.' }).optional(),
});

type PickupFormValues = z.infer<typeof formSchema>;

export function PickupOrderForm() {
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ✅ FIX: Create a type-safe helper for the translation function
  const tr = t as (key: string, params?: Record<string, any>) => string;

  const form = useForm<PickupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wasteType: undefined,
      quantity: '',
      preferredDate: undefined,
      notes: '',
    },
  });

  async function onSubmit(values: PickupFormValues) {
    console.log("PickupOrderForm onSubmit: User from AuthContext:", user);
    console.log("PickupOrderForm onSubmit: Values from form:", values);

    if (!user || !user.id || !user.name || !user.email) {
      toast({
        title: tr('userNotLoggedInError'),
        description: tr('pickupSubmitErrorDesc'),
        variant: 'destructive'
      });
      console.error("PickupOrderForm onSubmit: User data incomplete in AuthContext.", user);
      return;
    }
    setIsSubmitting(true);

    const newPickupData = {
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      wasteType: values.wasteType,
      quantity: values.quantity,
      preferredDate: Timestamp.fromDate(values.preferredDate),
      notes: values.notes || '',
      status: 'requested' as const,
      createdAt: serverTimestamp(),
    };
    console.log("PickupOrderForm onSubmit: Data being sent to Firestore:", newPickupData);

    try {
      await addDoc(collection(db, 'pickups'), newPickupData);
      toast({
        title: tr('pickupOrderSubmittedToastTitle'),
        // ✅ FIX: Use the type-safe helper function
        description: tr('pickupOrderSubmittedToastDesc', {
          wasteType: WASTE_TYPES.find(wt => wt.value === values.wasteType)?.label || values.wasteType,
          date: format(values.preferredDate, "PPP")
        }),
      });
      form.reset();
    } catch (error: any) {
      console.error("PickupOrderForm onSubmit: Error submitting pickup order to Firestore:", error);
      toast({
        title: tr('pickupSubmitErrorTitle'),
        // ✅ FIX: Use the type-safe helper function
        description: tr('pickupSubmitErrorFirebase', { code: error.code || 'N/A', message: error.message || tr('pickupSubmitErrorDesc')}),
        variant: 'destructive',
        duration: 9000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authIsLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="wasteType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tr('pickupFormWasteTypeLabel')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={tr('pickupFormWasteTypePlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{tr('servicesWasteTypesTitle')}</SelectLabel>
                    {WASTE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <type.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tr('pickupFormQuantityLabel')}</FormLabel>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl><Input placeholder={tr('pickupFormQuantityPlaceholder')} {...field} className="pl-10" /></FormControl>
              </div>
              <FormDescription>
                {tr('pickupFormQuantityHelper')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="preferredDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{tr('pickupFormDateLabel')}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>{tr('pickupFormDatePlaceholder')}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setDate(new Date().getDate() -1)) 
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tr('pickupFormNotesLabel')}</FormLabel>
                <div className="relative">
                <StickyNote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Textarea
                    placeholder={tr('pickupFormNotesPlaceholder')}
                    className="resize-y min-h-[100px] pl-10"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting || authIsLoading}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {isSubmitting ? tr('pickupFormSubmittingButton') : tr('pickupFormSubmitButton')}
        </Button>
      </form>
    </Form>
  );
}
