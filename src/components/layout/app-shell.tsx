
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SIDEBAR_LINKS, type NavLink } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, ChevronDown, ChevronUp, Recycle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import type { TranslationKey } from '@/lib/translations';

const AppHeader = () => {
  const { user, logout, isLoading: authIsLoading } = useAuth();
  const pathname = usePathname();
  const { t } = useLanguage();

  const findLabelKey = (links: NavLink[], path: string): TranslationKey | null => {
    for (const link of links) {
      if (path === link.href || (link.href !== '/dashboard' && path.startsWith(link.href))) {
         if (link.subLinks) {
            const subLabelKey = findLabelKey(link.subLinks, path);
            if (subLabelKey) return subLabelKey;
         }
         return link.labelKey;
      }
      if (link.subLinks) {
        const subLabelKey = findLabelKey(link.subLinks, path);
        if (subLabelKey) return subLabelKey;
      }
    }
    return null;
  };

  const pageTitleKey = findLabelKey(SIDEBAR_LINKS, pathname);
  const pageTitle = pageTitleKey ? t(pageTitleKey) : t('appName');

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle /> 
        {authIsLoading ? (
           <Skeleton className="h-10 w-28 rounded-full" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 rounded-full px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random&color=fff`} alt={user.name || 'User'} />
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <span className="ml-2 hidden md:inline">{user.name}</span>
                <ChevronDown className="ml-1 h-4 w-4 hidden md:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('accountSettingsNav')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logoutButton')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
           <Button asChild>
             <Link href="/login">{t('loginButton')}</Link>
           </Button>
        )}
      </div>
    </header>
  );
};


interface RecursiveNavItemProps {
  link: NavLink;
  pathname: string;
  level?: number;
}

const RecursiveNavItem: React.FC<RecursiveNavItemProps> = ({ link, pathname, level = 0 }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const isParentActive = (l: NavLink): boolean => {
    if (pathname === l.href || (l.href !== '/dashboard' && pathname.startsWith(l.href))) {
        return true;
    }
    return l.subLinks ? l.subLinks.some(sub => isParentActive(sub)) : false;
  }
  const [isOpen, setIsOpen] = React.useState(isParentActive(link));

  useEffect(() => {
    setIsOpen(isParentActive(link));
  }, [pathname, link]); // eslint-disable-line react-hooks/exhaustive-deps 

  if (!user || !link.allowedRoles.includes(user.role)) {
    return null;
  }

  const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href) && !link.subLinks);
  const isChildActive = link.subLinks ? link.subLinks.some(sub => isParentActive(sub)) : false;

  const translatedLabel = t(link.labelKey);

  const renderButton = () => (
    <SidebarMenuButton
      asChild={!link.subLinks}
      className={cn(
          level > 0 && "text-sm",
          (isActive || (isOpen && isChildActive && !link.subLinks)) && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
        )}
      isActive={isActive}
      onClick={link.subLinks ? () => setIsOpen(!isOpen) : undefined}
      tooltip={translatedLabel}
    >
      {link.subLinks ? (
        <div className="flex w-full items-center justify-between"> 
          <div className="flex items-center gap-2">
            <link.icon /> <span>{translatedLabel}</span>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      ) : (
        <Link href={link.href} className="flex items-center gap-2">
          <link.icon /> <span>{translatedLabel}</span>
        </Link>
      )}
    </SidebarMenuButton>
  );

  return (
    <SidebarMenuItem>
      {renderButton()}
      {link.subLinks && isOpen && (
        <SidebarMenuSub className="ml-4 pl-4 border-l border-sidebar-border">
          {link.subLinks.map(subLink => (
            <RecursiveNavItem key={subLink.href} link={subLink} pathname={pathname} level={level + 1} />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
};


const AppSidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t, dir } = useLanguage(); 

  if (!user) return null; 

  const groupedLinks = SIDEBAR_LINKS.reduce((acc, link) => {
    if (!link.allowedRoles.includes(user.role)) return acc;
    const groupName = link.groupKey ? t(link.groupKey) : t('generalGroupLabel');
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(link);
    return acc;
  }, {} as Record<string, NavLink[]>);

  const sidebarSide = dir === 'rtl' ? 'right' : 'left';

  return (
    <Sidebar collapsible="icon" variant="sidebar" side={sidebarSide}>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-semibold text-sidebar-foreground">
          <Recycle className="h-8 w-8 text-sidebar-primary" />
          <span className="group-data-[collapsible=icon]:hidden">{t('appName')}</span>
        </Link>
      </SidebarHeader>
      <ScrollArea className="flex-1">
        <SidebarContent>
          {Object.entries(groupedLinks).map(([groupName, links]) => (
            <div key={groupName} className="p-2">
              <p className="px-2 py-1 text-xs font-semibold text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                {groupName}
              </p>
              <SidebarMenu>
                {links.map(link => (
                  <RecursiveNavItem key={link.href} link={link} pathname={pathname} />
                ))}
              </SidebarMenu>
            </div>
          ))}
        </SidebarContent>
      </ScrollArea>
      <SidebarFooter className="p-4">
        <Button asChild variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center">
           <Link href="/dashboard/settings">
                <Settings className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{t('settingsNavLabel')}</span>
           </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};


export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authIsLoading } = useAuth();
  const { t } = useLanguage(); 
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = pathname === '/login'; // Adjusted to be more specific
  const isPublicRoute = !pathname.startsWith('/dashboard') && !isAuthRoute;
  
  // This local loading state helps manage the initial render until AuthContext hydration is complete
  const [isShellReady, setIsShellReady] = React.useState(false);

  useEffect(() => {
    console.log("AppShell Effect (Auth Monitor): Auth loading state:", authIsLoading);
    // Only set shell to ready once auth is no longer loading
    if (!authIsLoading) {
      setIsShellReady(true);
      console.log("AppShell Effect (Auth Monitor): Auth resolved. Shell is now ready. User:", user ? user.id : 'null');
    } else {
      setIsShellReady(false); // Explicitly set to false if auth is loading
    }
  }, [authIsLoading, user]);

  useEffect(() => {
    // Don't run navigation logic until the shell and auth context are definitively ready
    if (!isShellReady) {
      console.log("AppShell Effect (Navigation): Shell not ready (authIsLoading:", authIsLoading,"), deferring navigation logic.");
      return;
    }

    console.log("AppShell Effect (Navigation): Shell IS READY. User:", user ? user.id : 'null', "Pathname:", pathname, "isPublicRoute:", isPublicRoute, "isAuthRoute:", isAuthRoute);

    if (!user && !isPublicRoute && !isAuthRoute) { // If no user AND on a protected route (not public, not login)
      console.log("AppShell Effect (Navigation): No user, on protected route. Redirecting to /login.");
      router.replace('/login');
    } else if (user && isAuthRoute) { // If user exists AND on the login page
      console.log("AppShell Effect (Navigation): User exists, on login page. Redirecting to /dashboard.");
      router.replace('/dashboard');
    }
    // No action needed if user exists on a protected route, or if on a public route (user or no user)
  }, [user, isShellReady, authIsLoading, router, pathname, isPublicRoute, isAuthRoute]);


  // If shell isn't ready (i.e., authIsLoading was true or is still true), show a full-page loader.
  if (!isShellReady) {
    console.log("AppShell: Rendering full-page loader because shell is not ready (auth still loading).");
    return (
        <div className="flex h-screen items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">{t('loadingAppName')}</p>
          </div>
        </div>
    );
  }
  
  // If it's a public route (including login page if no user yet), render children directly.
  if (isPublicRoute || (isAuthRoute && !user)) {
     console.log("AppShell: Rendering children directly for public/auth route. Path:", pathname, "User:", user ? user.id : 'null');
     return <>{children}</>;
  }

  // If it's an app route (starts with /dashboard) and we have a user, render the authenticated shell
  if (pathname.startsWith('/dashboard') && user) {
    console.log("AppShell: Rendering authenticated app shell for path:", pathname);
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen">
          <AppSidebar />
          <SidebarInset className="flex flex-col">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-secondary/50">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }
  
  // Fallback / intermediate loading state if conditions for redirect or rendering are met but still waiting
  // This case should ideally be hit less often with the `isShellReady` logic.
  console.log("AppShell: Rendering fallback loader (e.g., user on protected route, but redirect not yet triggered or user object not fully available). Path:", pathname);
  return ( 
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">{t('loadingAppName')}</p>
    </div>
  );
}

    