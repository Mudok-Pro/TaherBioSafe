'use client';

import type { User, UserRole, CustomerTier } from '@/types';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDesc, DialogTrigger } from '@/components/ui/dialog';
import { UserForm } from '@/components/admin/user-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, query, Timestamp, type FieldValue, updateDoc, orderBy, limit, deleteField } from 'firebase/firestore';
import { useLanguage } from '@/context/language-context';
import { Alert, AlertDescription, AlertTitle as ShadAlertTitle } from "@/components/ui/alert";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: adminUser, isLoading: authIsLoading } = useAuth();
  const { t } = useLanguage();
  const tr = t as (key: string, params?: Record<string, any>) => string;

  const dialogTitleId = React.useId();
  const dialogDescriptionId = React.useId();

  const fetchUsers = useCallback(async () => {
    console.log("UserManagementPage: fetchUsers triggered. Current adminUser from context (AuthContext):", adminUser ? { id: adminUser.id, email: adminUser.email, role: adminUser.role } : "null");
    
    if (authIsLoading) {
      console.log("UserManagementPage: Auth is still loading, deferring fetchUsers.");
      setIsLoading(true);
      return;
    }

    if (!adminUser) {
      const notLoggedInMsg = tr('userManagementNotLoggedInError');
      console.error("UserManagementPage: No admin user found in AuthContext after auth loaded.");
      setError(notLoggedInMsg);
      setIsLoading(false);
      return;
    }
    
    if (adminUser.role !== 'admin' && adminUser.role !== 'owner') {
      const noPermissionMsg = tr('userManagementPermissionErrorAdminCustomClaim', { 
        adminEmail: adminUser.email || 'N/A', 
        requiredClaim: "{ role: 'admin' } or { role: 'owner' } in Firebase Auth Custom Claims (ID Token)" 
      });
      console.error(`UserManagementPage: User ${adminUser.email} with role ${adminUser.role} (from AuthContext) does not have admin/owner privileges for this action.`);
      setError(noPermissionMsg);
      setIsLoading(false);
      return;
    }

    console.log(`UserManagementPage: Admin user ${adminUser.email} (Role: ${adminUser.role}) is attempting to fetch users. Full adminUser object from AuthContext:`, JSON.stringify(adminUser, null, 2));
    setIsLoading(true);
    setError(null);

    try {
      console.log("UserManagementPage: Executing Firestore query to fetch all users from 'users' collection.");
      const usersCollectionRef = collection(db, 'users');
      const q = query(usersCollectionRef); 
      console.log("UserManagementPage: Query object constructed (no orderBy):", q);

      const querySnapshot = await getDocs(q);
      
      const fetchedUsers: User[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedUsers.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt?.seconds ? new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds).toDate().toISOString() : new Date().toISOString()),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : (data.updatedAt?.seconds ? new Timestamp(data.updatedAt.seconds, data.updatedAt.nanoseconds).toDate().toISOString() : new Date().toISOString()),
        } as User);
      });
      setUsers(fetchedUsers.sort((a, b) => (a.name || "").localeCompare(b.name || ""))); 
      console.log(`UserManagementPage: Users query successful. ${querySnapshot.size} documents found. Empty: ${querySnapshot.empty}. Fetched users:`, fetchedUsers);
    } catch (e: any) {
      console.error("UserManagementPage: Detailed error fetching users from Firestore (Full Error Object): ", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
      const errorDetails = e.code ? `Code: ${e.code}, Message: ${e.message}` : e.message;
      const specificErrorMsg = tr('userManagementFetchErrorAdminStrict', {
        adminEmail: adminUser?.email || 'N/A',
        errorDetails: errorDetails,
        customClaimExample: "{ role: 'admin' } or { role: 'owner' } in ID token",
        rulesChecked: "'allow list: if isAdmin();' on /users (where isAdmin checks request.auth.token.role)"
      });
      setError(specificErrorMsg);
      toast({
        title: tr('userManagementFetchErrorTitle'),
        description: specificErrorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log("UserManagementPage: fetchUsers finished.");
    }
  }, [adminUser, authIsLoading, tr, toast]);

  useEffect(() => {
    console.log(`UserManagementPage: useEffect triggered. authIsLoading: ${authIsLoading}, Admin user in context:`, adminUser ? { id: adminUser.id, role: adminUser.role, email: adminUser.email } : 'null');
    if (!authIsLoading && adminUser) { 
        if (adminUser.role === 'admin' || adminUser.role === 'owner') {
            fetchUsers();
        } else {
            const noPermissionMsg = tr('userManagementPermissionErrorAdminCustomClaim', { 
              adminEmail: adminUser.email || 'N/A', 
              requiredClaim: "{ role: 'admin' } or { role: 'owner' } in Firebase Auth Custom Claims (ID Token)" 
            });
            setError(noPermissionMsg);
            setIsLoading(false);
        }
    } else if (!authIsLoading && !adminUser) {
        setError(tr('userManagementNotLoggedInError'));
        setIsLoading(false);
    } else {
      setIsLoading(true); 
    }
  }, [adminUser, authIsLoading, fetchUsers, tr]);


  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    console.log(`UserManagementPage: handleDeleteUser called for UID: ${userId}. Admin:`, adminUser ? adminUser.id : 'null');
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'owner')) {
      toast({ title: tr('userManagementActionErrorTitle'), description: tr('userManagementNoPermissionError'), variant: "destructive" });
      return;
    }
    
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'owner' && adminUser.role !== 'owner') {
        toast({ title: tr('userManagementActionErrorTitle'), description: tr('userManagementCannotDeleteOwnerError'), variant: "destructive" });
        return;
    }
    if (userToDelete?.id === adminUser.id ) { 
        toast({ title: tr('userManagementActionErrorTitle'), description: tr('userManagementCannotDeleteSelfAsOwnerError'), variant: "destructive" });
        return;
    }

    try {
      console.log(`UserManagementPage: Attempting to delete user document 'users/${userId}' from Firestore.`);
      await deleteDoc(doc(db, 'users', userId));
      toast({ title: tr('userDeletedToastTitle'), description: tr('userDeletedToastDesc', { userId }) });
      fetchUsers(); 
      console.log(`UserManagementPage: Successfully deleted user document 'users/${userId}'.`);
    } catch (e: any) {
      console.error(`UserManagementPage: Error deleting user 'users/${userId}': `, e);
      toast({ title: tr('userManagementDeleteErrorTitle'), description: `${tr('contractManagementErrorPrefix')} ${e.message} (Code: ${e.code || 'N/A'})`, variant: "destructive" });
    }
  };
  
  const handleFormSubmit = async (userData: User) => {
    console.log("UserManagementPage: handleFormSubmit called with data:", userData, "Admin:", adminUser ? adminUser.id : 'null');
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'owner')) {
      toast({ title: tr('userManagementActionErrorTitle'), description: tr('userManagementNoPermissionError'), variant: "destructive" });
      return;
    }
    
    if (!userData.id || userData.id.startsWith('new-')) {
        console.error("UserManagementPage: UserForm submitted without a valid Firebase Auth UID for user profile.");
        toast({ title: "Error", description: "Cannot save user profile without a valid Firebase Auth UID.", variant: "destructive"});
        setIsFormOpen(false);
        return;
    }

    const userProfileData: Partial<User> & { updatedAt: FieldValue, createdAt?: FieldValue, tier?: CustomerTier | FieldValue } = {
        name: userData.name,
        email: userData.email, 
        role: userData.role,   
        avatarUrl: userData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random&color=fff`,
        updatedAt: serverTimestamp(),
    };
    if (userData.role === 'customer') {
        userProfileData.tier = userData.tier || 'standard';
    } else {
        if (selectedUser && selectedUser.tier) { 
            (userProfileData as any).tier = deleteField(); 
        }
    }

    try {
        const userDocRef = doc(db, 'users', userData.id); 
        if (selectedUser) { 
            console.log(`UserManagementPage: Attempting to update existing user profile 'users/${userData.id}' with data:`, userProfileData);
            await updateDoc(userDocRef, userProfileData as any); 
            toast({ title: tr('userUpdatedToastTitle'), description: tr('userUpdatedToastDesc', { userName: userData.name || 'User' }) });
            console.log(`UserManagementPage: Successfully updated user profile 'users/${userData.id}'.`);
        } else { 
            userProfileData.id = userData.id;
            userProfileData.createdAt = serverTimestamp();
            console.log(`UserManagementPage: Attempting to create new user profile 'users/${userData.id}' with data:`, userProfileData);
            await setDoc(userDocRef, userProfileData); 
            toast({ title: tr('userAddedToastTitle'), description: tr('userAddedToastDesc', { userName: userData.name || 'User' }) });
            console.log(`UserManagementPage: Successfully created user profile 'users/${userData.id}'.`);
        }
        setIsFormOpen(false);
        setSelectedUser(null);
        fetchUsers(); 
      } catch (e: any) {
        console.error(`UserManagementPage: Error saving user profile 'users/${userData.id}': `, e);
        const errorDetails = e.code ? `Code: ${e.code}, Message: ${e.message}` : e.message;
        toast({ title: tr('userManagementSaveErrorTitle'), description: `${tr('contractManagementErrorPrefix')} ${errorDetails}`, variant: "destructive" });
      }
  };
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'bg-purple-600';
      case 'admin': return 'bg-red-500';
      case 'driver': return 'bg-blue-500';
      case 'customer': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (authIsLoading || (isLoading && !error && users.length === 0 && !adminUser)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">{tr('loadingAppName')}</p>
      </div>
    );
  }

  if (error && !(isLoading && users.length === 0)) { 
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto my-8">
        <AlertTriangle className="h-4 w-4" />
        <ShadAlertTitle>{tr('userManagementFetchErrorTitle')}</ShadAlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">{tr('userManagementTitle')}</CardTitle>
            <CardDescription>{tr('userManagementDesc')}</CardDescription>
          </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddUser}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {tr('userManagementAddButton')}
                </Button>
            </DialogTrigger>
            <DialogContent 
              className="sm:max-w-[525px]"
              aria-labelledby={dialogTitleId}
              aria-describedby={dialogDescriptionId}
            >
                <DialogHeader>
                    <DialogTitle id={dialogTitleId}>
                        {selectedUser ? tr('userManagementDialogTitleEdit') : tr('userManagementDialogTitleAdd')}
                    </DialogTitle>
                    <DialogDesc id={dialogDescriptionId}>
                        {selectedUser ? tr('userManagementDialogDescEdit', { userName: selectedUser.name || 'User' }) : tr('userManagementDialogDescAdd')}
                    </DialogDesc>
                </DialogHeader>
                <UserForm 
                    user={selectedUser} 
                    onSubmit={handleFormSubmit} 
                    onCancel={() => { setIsFormOpen(false); setSelectedUser(null); }} 
                />
            </DialogContent>
        </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading && users.length === 0 ? ( 
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">{tr('userManagementLoadingUsers')}</p>
              </div>
          ) : !isLoading && error && users.length === 0 && adminUser && (adminUser.role === 'admin' || adminUser.role === 'owner') ? ( 
              <Alert variant="destructive" className="max-w-xl mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <ShadAlertTitle>{tr('userManagementFetchErrorTitle')}</ShadAlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          ) : users.length === 0 && adminUser && (adminUser.role === 'admin' || adminUser.role === 'owner') ? (
            <div className="py-10 text-center text-muted-foreground">
              <p className="text-lg">{tr('userManagementNoUsersFound')}</p>
              <p>{tr('userManagementNoUsersFirestoreCheck', { adminEmail: adminUser?.email || 'admin@example.com' })}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tr('userTableHeadUser')}</TableHead>
                  <TableHead>{tr('userTableHeadEmail')}</TableHead>
                  <TableHead>{tr('userTableHeadRole')}</TableHead>
                  <TableHead>{tr('userTableHeadTier')}</TableHead>
                  <TableHead className="text-right">{tr('userTableHeadActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random&color=fff`} alt={user.name || 'User avatar'} />
                          <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{user.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`${getRoleBadgeColor(user.role)} text-white capitalize`}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{user.tier || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{tr('userTableActionOpenMenu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{tr('userTableHeadActions')}</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" /> {tr('userTableActionEdit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={(user.role === 'owner' && adminUser?.role !== 'owner') || user.id === adminUser?.id} 
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> {tr('userTableActionDelete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
