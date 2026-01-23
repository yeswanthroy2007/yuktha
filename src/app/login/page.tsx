
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    const name = userName || 'John Doe';
    login(name, 'user');
    router.push('/dashboard');
  };

  const handleSignUp = () => {
    // For demo, signup just logs in the user
    const name = userName || 'New User';
    login(name, 'user');
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4 mb-8 text-center">
         <Logo className="h-14" />
      </div>
      <Tabs defaultValue="signin" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
            <Card className="border-border">
                <CardHeader>
                <CardTitle className="font-headline">Sign in to your account</CardTitle>
                <CardDescription>Access your health dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="signin-name">Full Name</Label>
                    <Input id="signin-name" placeholder="John Doe" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" placeholder="••••••••" />
                </div>
                </CardContent>
                <CardFooter>
                <Button className="w-full" onClick={handleLogin}>
                    Sign In
                </Button>
                </CardFooter>
            </Card>
        </TabsContent>
         <TabsContent value="signup">
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="font-headline">Create your account</CardTitle>
                    <CardDescription>Start your health journey with us.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" placeholder="John Doe" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="john.doe@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" />
                </div>
                </CardContent>
                <CardFooter>
                <Button className="w-full" onClick={handleSignUp}>
                    Create Account
                </Button>
                </CardFooter>
            </Card>
        </TabsContent>
      </Tabs>
      <p className="mt-8 text-sm text-muted-foreground text-center max-w-sm">For demo purposes, password is not required. Enter a name or use the placeholder.</p>
    </main>
  );
}
