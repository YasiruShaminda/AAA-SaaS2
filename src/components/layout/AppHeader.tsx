
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { User, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logo from '@/components/icons/logo.png';
import Link from 'next/link';

const pageTitles: { [key: string]: string } = {
  '/': 'Dashboard',
  '/workflows': 'Workflow Designer',
  '/vendors': 'Vendor Profiles',
  '/sessions': 'Active Sessions',
  '/subscribers': 'Subscribers',
  '/clients': 'Client Management',
  '/database': 'Database Management',
  '/subscription': 'Subscription',
  '/testing': 'Workflow Tester',
  '/projects': 'Projects',
  '/settings': 'Settings',
  '/organizations': 'Organizations',
  '/organizations/new': 'Create Organization',
  '/profile': 'User Profile',
};

export function AppHeader() {
  const pathname = usePathname();
  const { selectedOrganization } = useOrganization();
  const { user } = useAuth();
  const title = pageTitles[pathname] || 'Monyfi SaaS';

  // Debug: Log user data to see what's actually being received
  console.log('AppHeader user data:', user);
  console.log('User name specifically:', user?.name);
  console.log('User object keys:', user ? Object.keys(user) : 'No user');

  // Handle different possible field names from the API
  const userAny = user as any;
  const displayName = user?.name || userAny?.userName || userAny?.username || userAny?.fullName || userAny?.full_name || userAny?.display_name || 'User';
  
  console.log('Final display name:', displayName);

  // Generate initials from user name
  const getInitials = (name: string) => {
    if (!name || name === 'User') return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userInitials = getInitials(displayName);
  console.log('User initials:', userInitials);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="hidden md:flex" />
        <div className="flex items-center gap-2 md:hidden">
            <Image 
                src={logo}
                alt="Logo"
                width={32}
                height={32}
            />
            <span className="font-headline text-lg font-semibold">Monify SaaS</span>
        </div>
        <h1 className="hidden text-xl font-semibold font-headline md:block">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/profile-pic.png" alt="User Profile Picture" />
            <AvatarFallback className="text-sm font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium">{displayName}</span>
        </Link>
      </div>
    </header>
  );
}
