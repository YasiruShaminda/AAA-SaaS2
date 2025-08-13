
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { User, Bell, Waypoints, ChevronsUpDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import logo from '@/components/icons/logo.png';

const pageTitles: { [key: string]: string } = {
  '/': 'Dashboard',
  '/workflows': 'Workflow Designer',
  '/vendors': 'Vendor Profiles',
  '/quick-start': 'Quick Start',
  '/sessions': 'Active Sessions',
  '/subscribers': 'Subscribers',
  '/clients': 'Client Management',
  '/database': 'Database Management',
  '/billing': 'Billing',
  '/testing': 'Workflow Tester',
  '/organizations': 'Organizations',
};

export function AppHeader() {
  const pathname = usePathname();
  const [aaaName, setAaaName] = useState<string | null>('Primary AAA');
  const [aaaSystems, setAaaSystems] = useState(['Primary AAA', 'Backup AAA', 'Dev AAA']);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedAaaName = localStorage.getItem('aaaName');
    if (savedAaaName) {
        setAaaName(savedAaaName);
        if (!aaaSystems.includes(savedAaaName)) {
            setAaaSystems(prev => [savedAaaName, ...prev.filter(s => s !== 'Primary AAA')]);
        }
    }
  }, [pathname]);

  const title = pageTitles[pathname] || 'Monify SaaS';

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
        {isClient && aaaName && (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hidden sm:inline-flex">
                        <span className="font-medium text-muted-foreground">{aaaName}</span>
                        <ChevronsUpDown className="ml-2 size-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {aaaSystems.map(system => (
                        <DropdownMenuItem key={system} onSelect={() => setAaaName(system)}>
                            {system}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
             </DropdownMenu>
        )}
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">User Profile</span>
        </Button>
      </div>
    </header>
  );
}
