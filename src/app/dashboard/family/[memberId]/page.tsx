
"use client";

import { useParams, useRouter } from "next/navigation";
import { mockFamilyMembers } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, FileText, Pill } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FamilyMemberDetailPage() {
    const router = useRouter();
    const params = useParams<{ memberId: string }>();
    const memberId = params.memberId;

    const member = mockFamilyMembers.find(m => m.id === memberId);

    if (!member) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-xl font-semibold">Family Member Not Found</h2>
                <p className="text-muted-foreground">The requested family member could not be found.</p>
                <Button variant="link" onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

    const memberMeds = {
        'fam-001': [{ name: 'Children\'s Multivitamin', dosage: '1 gummy daily' }, { name: 'Albuterol Inhaler', dosage: 'As needed' }],
        'fam-002': [{ name: 'Lisinopril', dosage: '20mg daily' }, { name: 'Simvastatin', dosage: '40mg daily' }],
    }[member.id] || [];

    const memberReports = {
        'fam-001': [{ name: 'Annual Check-up', date: '2024-05-10' }],
        'fam-002': [{ name: 'Blood Test Panel', date: '2024-07-15' }],
    }[member.id] || [];

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/family')}>
                    <ArrowLeft />
                </Button>
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary">
                        <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold font-headline">{member.name}</h1>
                        <p className="text-muted-foreground">{member.relation}</p>
                    </div>
                </div>
                <Button variant="outline" size="icon" className="ml-auto">
                    <Edit className="h-4 w-4" />
                </Button>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline">Medications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {memberMeds.length > 0 ? (
                            <div className="space-y-3">
                                {memberMeds.map((med, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            <Pill className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{med.name}</p>
                                            <p className="text-sm text-muted-foreground">{med.dosage}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No medications listed.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline">Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {memberReports.length > 0 ? (
                            <div className="space-y-3">
                                {memberReports.map((report, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{report.name}</p>
                                            <p className="text-sm text-muted-foreground">{report.date}</p>
                                        </div>
                                        <Button variant="link" size="sm" className="ml-auto">View</Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No reports available.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
