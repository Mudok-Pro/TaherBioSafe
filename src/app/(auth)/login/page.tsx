'use client';

import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Recycle } from 'lucide-react'; 
import { useLanguage } from '@/context/language-context';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Recycle className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">{t('appName')}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('manageWasteIncineration')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          {/* 
            Sign-in Process:
            This form uses a mock authentication system for demonstration. 
            1. Enter any email and a password (at least 6 characters).
            2. Select a user role (Customer, Admin, Driver, Owner) from the dropdown. This determines the dashboard features you'll see after logging in.
            3. Click the "Login" button.
            The system simulates a successful login for the chosen role and redirects you to the appropriate dashboard view. 
            In a real application, this would involve verifying credentials against a database.
          */}
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {t('appName')}. {t('copyright')}
      </p>
    </div>
  );
}
