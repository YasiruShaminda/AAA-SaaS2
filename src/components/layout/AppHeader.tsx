import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import Image from 'next/image';
import logo from '@/components/icons/logo.png';
import { AuthButton } from '@/components/auth/auth-button';

export async function AppHeader() {
  const title = 'Monyfi SaaS';

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
        <AuthButton />
      </div>
    </header>
  );
}
