
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, you would clear the user session here
    router.push('/login');
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/profile-pic.png" alt="User Profile Picture" />
                <AvatarFallback>
                    <User className="h-12 w-12" />
                </AvatarFallback>
            </Avatar>
          <CardTitle className="text-3xl font-headline">Admin</CardTitle>
          <CardDescription>Logged in as: admin</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
