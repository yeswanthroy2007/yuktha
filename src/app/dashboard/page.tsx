
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Pill, FileText, CheckCircle, Check, X, Users } from "lucide-react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMedicine } from "@/context/medicine-context";
import { useEffect, useState } from "react";
import { Medicine } from "@/lib/data";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { NotificationBell } from "@/components/dashboard/notification-bell";


export default function DashboardPage() {
  const { user } = useAuth();
  const { medicines, setMedicines } = useMedicine();
  const [adherence, setAdherence] = useState(0);
  const [todayMeds, setTodayMeds] = useState(medicines.slice(0,3));
  const [confirmation, setConfirmation] = useState<{medId: number, status: boolean, medName: string} | null>(null);

  useEffect(() => {
    const takenCount = medicines.filter(m => m.taken === true).length;
    const skippedCount = medicines.filter(m => m.taken === false).length;
    const totalDecided = takenCount + skippedCount;
    const newAdherence = totalDecided > 0 ? Math.round((takenCount / totalDecided) * 100) : 0;
    setAdherence(newAdherence);
    setTodayMeds(medicines.slice(0,3));
  }, [medicines]);

  const handleDose = (id: number, status: boolean) => {
    setMedicines(medicines.map(med => med.id === id ? {...med, taken: status} : med));
  };
  
  const handleConfirmDose = () => {
    if (confirmation) {
        handleDose(confirmation.medId, confirmation.status);
        setConfirmation(null);
    }
  }

  const getPillColor = (med: (typeof todayMeds)[0]) => {
    if (med.taken === true) {
      return "text-primary";
    }
    if (med.taken === false) {
      return "text-destructive";
    }
    return "text-yellow-500";
  }

    const getPillBg = (med: (typeof todayMeds)[0]) => {
    if (med.taken === true) {
      return "bg-primary/10";
    }
    if (med.taken === false) {
      return "bg-destructive/10";
    }
    return "bg-yellow-400/20";
  }


  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      <div className="bg-gradient-to-br from-cyan-400 to-green-400 text-white rounded-b-3xl sm:rounded-2xl p-6 shadow-lg space-y-4 sm:space-y-6 -mx-4 -mt-4 sm:mx-0 sm:mt-0">
          <div className="flex justify-between items-center">
              <div>
                  <h1 className="text-xl sm:text-2xl font-bold">Good Morning!</h1>
                  <p className="opacity-90 text-sm sm:text-base">{user?.name}</p>
              </div>
              <div className="flex items-center gap-4">
                  <NotificationBell />
              </div>
          </div>
          <div>
              <p className="text-xs sm:text-sm opacity-90">This Week's Adherence</p>
              <div className="flex items-end gap-2 sm:gap-4 mt-1">
                <p className="text-4xl sm:text-5xl font-bold">{adherence}%</p>
                <div className="relative h-12 w-12 sm:h-16 sm:w-16">
                    <svg className="h-full w-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-white/30" strokeWidth="3"></circle>
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-white" strokeWidth="3" strokeDasharray={`${adherence}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)"></circle>
                    </svg>
                    <CheckCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 text-white"/>
                </div>
              </div>
          </div>
      </div>
      
       <div>
           <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <Button asChild className="shrink-0 rounded-full" >
                <Link href="/dashboard/med-tracker">
                    <Pill className="mr-2 h-4 w-4"/> Reminders
                </Link>
              </Button>
              <Button asChild variant="outline" className="shrink-0 rounded-full bg-card border-border">
                  <Link href="/dashboard/reports">
                    <FileText className="mr-2 h-4 w-4"/> Reports
                  </Link>
              </Button>
               <Button asChild variant="outline" className="shrink-0 rounded-full bg-card border-border">
                  <Link href="/dashboard/family">
                    <Users className="mr-2 h-4 w-4"/> Family
                  </Link>
              </Button>
           </div>
       </div>

        <div>
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold font-headline">Today's Schedule</h2>
              <Link href="/dashboard/med-tracker" className="text-sm font-medium text-primary hover:underline">
                  View All
              </Link>
          </div>
          <AlertDialog open={!!confirmation} onOpenChange={(open) => !open && setConfirmation(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                        <AlertDialogDescription>
                             Are you sure you want to mark {confirmation?.medName} as {confirmation?.status ? 'taken' : 'skipped'}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmation(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDose}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          <div className="space-y-4">
            {todayMeds.map(med => (
              <Card key={med.id} className="shadow-none sm:shadow-soft flex items-center transition-all hover:sm:shadow-soft-lg">
                  <CardContent className="p-4 flex items-center gap-4 flex-grow">
                      <div className={`p-3 rounded-full ${getPillBg(med)}`}>
                        <Pill className={`h-6 w-6 ${getPillColor(med)}`}/>
                      </div>
                      <div className="flex-grow">
                          <p className="font-semibold">{med.name}</p>
                          <p className="text-sm text-muted-foreground">{med.dosage}</p>
                      </div>
                      <div className="text-right">
                         <p className="font-medium">{med.time}</p>
                         {med.taken === null ? (
                            <div className="flex items-center gap-1 mt-2">
                               <Button size="icon" variant="outline" className="h-8 w-8 bg-red-100/50 border-red-200 text-red-600 hover:bg-red-100" onClick={() => setConfirmation({medId: med.id, status: false, medName: med.name})}>
                                    <X className="h-4 w-4"/>
                                </Button>
                                <Button size="icon" variant="outline" className="h-8 w-8 bg-green-100/50 border-green-200 text-green-600 hover:bg-green-100" onClick={() => setConfirmation({medId: med.id, status: true, medName: med.name})}>
                                    <Check className="h-4 w-4"/>
                                </Button>
                            </div>
                        ) : med.taken === true ? (
                            <Badge className="mt-2" variant="secondary">Taken</Badge>
                        ) : (
                            <Badge className="mt-2" variant="destructive">Skipped</Badge>
                        )}
                      </div>
                  </CardContent>
              </Card>
            ))}
          </div>
        </div>
    </div>
  );
}

    
