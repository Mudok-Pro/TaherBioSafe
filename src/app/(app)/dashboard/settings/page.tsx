'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle, Mail, KeyRound, UploadCloud, Save, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React, { useRef, useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '@/context/language-context';
// TODO: Import Firebase Auth functions for password change when fully implementing
// import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const settingsFormSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty." }),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false; // Current password is required if new password is set
  }
  return true;
}, {
  message: "Current password is required to set a new password.",
  path: ["currentPassword"],
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"],
}).refine(data => {
  if (data.newPassword && (data.newPassword.length < 6)) {
    return false;
  }
  return true;
}, {
  message: "New password must be at least 6 characters.",
  path: ["newPassword"],
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { user, firebaseUser, isLoading: authLoading } = useAuth(); // Added firebaseUser
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const tr = t as (key: string, params?: Record<string, any>) => string;

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: user?.name || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name });
    }
  }, [user, reset]);

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected avatar file:", file);
      toast({
        title: tr('avatarSelectedToastTitle'),
        description: tr('avatarSelectedToastDesc', {fileName: file.name}),
      });
      // TODO: Implement actual avatar upload to Firebase Storage
      // and update user.avatarUrl in Firestore & AuthContext
    }
  };

  const onSubmit: SubmitHandler<SettingsFormValues> = async (data) => {
    if (!user || !firebaseUser) {
      toast({ title: tr('errorDialogTitle'), description: tr('userNotLoggedInError'), variant: "destructive" });
      return;
    }

    setIsSaving(true);
    let changesMade = false;

    // Update name if changed
    if (data.name !== user.name) {
      try {
        const userDocRef = doc(db, "users", user.id);
        await updateDoc(userDocRef, { name: data.name });
        // Ideally, update AuthContext here or trigger a refresh.
        // For now, user will see change on next login or if AuthContext auto-refreshes.
        toast({ title: tr('profileUpdateSuccessTitle'), description: tr('profileNameUpdateSuccessDesc') });
        changesMade = true;
      } catch (error: any) {
        console.error("Error updating name:", error);
        toast({ title: tr('profileUpdateErrorTitle'), description: error.message, variant: "destructive" });
      }
    }

    // Handle password change if new password is provided
    if (data.newPassword && data.currentPassword) {
      // IMPORTANT: Actual Firebase password change is more complex
      // It often requires re-authentication for security.
      // This is a STUB for now.
      console.log("Attempting to change password (stubbed)");
      toast({
        title: tr('passwordChangeAttemptTitle'),
        description: tr('passwordChangeStubDesc'),
        variant: "default"
      });
      changesMade = true;
      // TODO: Implement actual Firebase password change:
      // 1. Re-authenticate user with currentPassword:
      //    const credential = EmailAuthProvider.credential(firebaseUser.email!, data.currentPassword);
      //    await reauthenticateWithCredential(firebaseUser, credential);
      // 2. Update password:
      //    await updatePassword(firebaseUser, data.newPassword);
      //    toast({ title: "Password Changed", description: "Your password has been updated." });
      // Catch errors for re-authentication failure or password update failure
    } else if (data.newPassword && !data.currentPassword) {
        // This case should be caught by Zod refine, but as a fallback:
        toast({ title: tr('errorDialogTitle'), description: tr('passwordChangeCurrentRequiredError'), variant: "destructive" });
    }


    if (!changesMade && !(data.newPassword && data.currentPassword)) {
      toast({ title: tr('noChangesDetectedToastTitle'), description: tr('noChangesDetectedToastDesc') });
    }
    
    reset({ // Reset password fields
      name: data.name, // Keep the updated name in the form
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsSaving(false);
  };
  
  if (authLoading || !user) {
    return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">{tr('loadingUserSettings')}</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">{tr('settingsTitle')}</CardTitle>
          <CardDescription>{tr('settingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                  <UserCircle className="mr-2 h-5 w-5 text-primary" /> {tr('settingsProfileInfoTitle')}
              </h3>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random&color=fff`} alt={user.name || 'User'} />
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="image/*" 
                  onChange={handleAvatarFileChange} 
                />
                <Button type="button" variant="outline" onClick={handleAvatarButtonClick}>
                  <UploadCloud className="mr-2 h-4 w-4" /> {tr('settingsChangeAvatarButton')}
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor="name">{tr('settingsFullNameLabel')}</Label>
                      <Input id="name" {...register("name")} className="mt-1" />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                      <Label htmlFor="email">{tr('settingsEmailLabel')}</Label>
                      <Input id="email" type="email" defaultValue={user.email} className="mt-1" readOnly disabled />
                  </div>
              </div>
              {user.role === 'customer' && user.tier && (
                  <div>
                      <Label htmlFor="tier">{tr('settingsCustomerTierLabel')}</Label>
                      <Input id="tier" defaultValue={user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} className="mt-1 capitalize" readOnly disabled />
                  </div>
              )}
            </div>

            <Separator />

            {/* Security Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                  <KeyRound className="mr-2 h-5 w-5 text-primary" /> {tr('settingsSecurityTitle')}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor="current-password">{tr('settingsCurrentPasswordLabel')}</Label>
                      <Input id="current-password" type="password" placeholder="••••••••" {...register("currentPassword")} className="mt-1" />
                      {errors.currentPassword && <p className="text-sm text-destructive mt-1">{errors.currentPassword.message}</p>}
                  </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor="newPassword">{tr('settingsNewPasswordLabel')}</Label>
                      <Input id="newPassword" type="password" placeholder={tr('settingsNewPasswordPlaceholder')} {...register("newPassword")} className="mt-1" />
                      {errors.newPassword && <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>}
                  </div>
                  <div>
                      <Label htmlFor="confirmPassword">{tr('settingsConfirmPasswordLabel')}</Label>
                      <Input id="confirmPassword" type="password" placeholder={tr('settingsConfirmPasswordPlaceholder')} {...register("confirmPassword")} className="mt-1" />
                      {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
                  </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Action Button */}
            <div className="flex justify-end">
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? tr('savingChangesButton') : tr('settingsSaveChangesButton')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
