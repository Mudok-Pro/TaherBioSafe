'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { UserRole, CustomerTier } from '@/types';
import { auth } from '@/lib/firebase'; // Ensure this path is correct
// ✅ FIX: Remove FirebaseError, as it's no longer exported directly.
import { signInWithEmailAndPassword } from 'firebase/auth'; 

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, KeyRound, LogIn, UserCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { USER_ROLES, CUSTOMER_TIERS } from '@/lib/constants';
import { useLanguage } from '@/context/language-context';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.custom<UserRole>(val => USER_ROLES.map(r => r.value).includes(val as UserRole), {
    message: "Invalid role selected."
  }),
  tier: z.custom<CustomerTier>(val => CUSTOMER_TIERS.map(t => t.value).includes(val as CustomerTier)).optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).optional(),
}).refine(data => data.role !== 'customer' || (data.role === 'customer' && data.tier), {
  message: "Customer tier is required if role is Customer.",
  path: ["tier"],
});

export function LoginForm() {
  const router = useRouter();
  const { loginWithFirebase } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = React.useState(false);
  const [firebaseError, setFirebaseError] = React.useState<string | null>(null);
  const tr = t as (key: string, params?: Record<string, any>) => string;


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'customer',
      tier: 'standard',
      name: '',
    },
  });

  const selectedRole = form.watch("role");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setFirebaseError(null);
    console.log("LoginForm: Attempting Firebase sign-in for email:", values.email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;
      console.log("LoginForm: Firebase sign-in successful, UID:", firebaseUser.uid);

      await loginWithFirebase(firebaseUser, values.role, values.tier, values.name || firebaseUser.displayName || '');
      
      toast({
        title: tr('loginSuccessTitle'),
        // ✅ FIX: Cast the translation function to 'any' to allow for interpolation
        description: tr('loginSuccessDesc', { role: values.role }), 
      });
    } catch (error: any) { // ✅ FIX: Catch error as 'any'
      const fbError = error; // The error object will have a 'code' property
      console.error("LoginForm: Firebase sign-in error:", fbError.code, fbError.message);
      let errorMessageKey: string = 'loginErrorDefault';
      switch (fbError.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessageKey = 'loginErrorInvalidCredential';
          break;
        case 'auth/too-many-requests':
            errorMessageKey = 'loginErrorTooManyRequests';
            break;
        default:
          errorMessageKey = 'loginErrorDefault';
      }
      setFirebaseError(tr(errorMessageKey as any));
      toast({
        title: tr('loginErrorTitle'),
        description: tr(errorMessageKey as any),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      console.log("LoginForm: onSubmit finished.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {firebaseError && (
          <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> {firebaseError}
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">{tr('formLabelName')}</FormLabel>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder={tr('formPlaceholderName')} {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormDescription>{tr('formDescName')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">{tr('formLabelEmail')}</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="you@example.com" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">{tr('formLabelPassword')}</FormLabel>
                <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">{tr('formLabelRole')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={tr('formPlaceholderRole')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {USER_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{tr('loginRoleSelectionDesc')}</FormDescription>
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
                <FormLabel className="text-foreground">{tr('formLabelTier')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={tr('formPlaceholderTier')} />
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
        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {tr('loginButtonLoading')}
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-5 w-5" />
              {tr('loginButton')}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
