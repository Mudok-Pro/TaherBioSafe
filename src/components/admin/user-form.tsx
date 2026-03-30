'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { User, UserRole, CustomerTier } from '@/types';
import { USER_ROLES, CUSTOMER_TIERS } from '@/lib/constants';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  role: z.custom<UserRole>(val => USER_ROLES.map(r => r.value).includes(val as UserRole), {
    message: "Invalid role selected."
  }),
  tier: z.custom<CustomerTier>(val => CUSTOMER_TIERS.map(t => t.value).includes(val as CustomerTier)).optional(),
  password: z.string().min(8, {message: "Password must be at least 8 characters."}).optional(), // Optional for edit, required for new
}).refine(data => data.role !== 'customer' || (data.role === 'customer' && data.tier), {
    message: "Customer tier is required if role is Customer.",
    path: ["tier"],
});

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: User) => void;
  onCancel: () => void;
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'customer',
      tier: user?.tier || undefined,
      password: '',
    },
  });
  
  const selectedRole = form.watch("role");

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        password: '', // Password field is for new or changing, not displaying existing
      });
    } else {
        form.reset({ name: '', email: '', role: 'customer', tier: undefined, password: ''});
    }
  }, [user, form]);

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    const submissionData: User = {
      id: user?.id || `new-${Date.now()}`, // Keep existing ID or generate placeholder
      ...values,
      tier: values.role === 'customer' ? values.tier : undefined, // Ensure tier is only set for customers
    };
    // Password handling would be more complex in a real app
    // e.g., only send password if it's being changed or for a new user
    onSubmit(submissionData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
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
              <FormControl>
                <Input type="email" placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!user && ( // Only show password for new users for simplicity, or if specifically changing it
             <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormDescription>
                    Required for new users. Min 8 characters.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {USER_ROLES.filter(r => r.value !== 'owner' || user?.role === 'owner').map(role => ( // Prevent assigning 'owner' unless current user is owner
                    <SelectItem key={role.value} value={role.value} disabled={role.value === 'owner' && user?.role !== 'owner'}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedRole === 'customer' && (
          <FormField
            control={form.control}
            name="tier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Tier</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer tier" />
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
        )}
        <DialogFooter className="pt-4">
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                {user ? 'Save Changes' : 'Create User'}
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
