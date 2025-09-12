
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

  return (
    <div className="flex h-full min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/profile-pic.png" alt="User Profile Picture" />
                <AvatarFallback className="text-lg font-semibold">
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
