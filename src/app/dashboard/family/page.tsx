
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowLeft } from "lucide-react";
import { mockFamilyMembers } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FamilyMembersPage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
             <div className="sm:hidden -ml-4 -mt-4 mb-4 border-b">
                 <header className="p-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                    </Button>
                    <h2 className="font-semibold">Family Members</h2>
                </header>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Family Members</h1>
                    <p className="text-muted-foreground">
                        Manage medical profiles and caregiver access for your loved ones.
                    </p>
                </div>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4"/> Add Member
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockFamilyMembers.map((member) => (
                     <Link href={`/dashboard/family/${member.id}`} key={member.id}>
                        <Card className="hover:bg-card/80 transition-colors h-full">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person portrait" />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold font-headline">{member.name}</h3>
                                    <p className="text-sm text-muted-foreground">{member.relation}</p>
                                </div>
                            </CardContent>
                        </Card>
                     </Link>
                ))}
            </div>
        </div>
    );
}
