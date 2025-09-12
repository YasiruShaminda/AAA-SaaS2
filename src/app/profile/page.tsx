
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { logout, user } = useAuth();

  // Handle different possible field names from the API
  const userAny = user as any;
  const displayName = user?.name || userAny?.userName || userAny?.username || userAny?.fullName || userAny?.full_name || userAny?.display_name || 'User';
  const displayEmail = user?.email || 'Unknown';

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

  // Generate color based on user name for variety
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-950 to-blue-1000 text-blue-700 ring-blue-500/50',
      'bg-gradient-to-br from-emerald-950 to-emerald-1000 text-emerald-700 ring-emerald-500/50',
      'bg-gradient-to-br from-purple-950 to-purple-1000 text-purple-700 ring-purple-500/50',
      'bg-gradient-to-br from-amber-950 to-amber-1000 text-amber-700 ring-amber-500/50',
      'bg-gradient-to-br from-rose-950 to-rose-1000 text-rose-700 ring-rose-500/50',
      'bg-gradient-to-br from-cyan-950 to-cyan-1000 text-cyan-700 ring-cyan-500/50',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const avatarColorClass = getAvatarColor(displayName);

  return (
    <div className="flex h-full min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="items-center text-center">
            <Avatar className={`h-24 w-24 mb-4 ring-4 ${avatarColorClass.split(' ').find(c => c.startsWith('ring-'))}`}>
                {/* Remove AvatarImage to always show initials for now */}
                <AvatarFallback className={`text-4xl font-medium border-2 border-slate-00 ${avatarColorClass.split(' ').filter(c => !c.startsWith('ring-')).join(' ')}`}>
                    {userInitials}
                </AvatarFallback>
            </Avatar>
          <CardTitle className="text-3xl font-headline">{displayName}</CardTitle>
          <CardDescription>Logged in as: {displayEmail}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={logout}>
            <LogOut className="mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
