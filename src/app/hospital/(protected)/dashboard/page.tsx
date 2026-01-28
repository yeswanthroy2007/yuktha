'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import {
    QrCode,
    Search,
    User,
    Activity,
    AlertTriangle,
    Pill,
    Stethoscope,
    Droplet,
    Plus,
    Users,
    Trash2,
    CheckCircle,
    UserPlus,
    Building2,
    Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HospitalProfile {
    id: string;
    name: string;
    roles: string[];
}

interface PatientData {
    id: string;
    name: string;
    bloodGroup: string;
    allergies: string;
    medications: string;
    emergencyContact: string;
}

interface StaffMember {
    _id: string;
    name: string;
    email?: string;
    specialty?: string;
    location?: string;
    type: 'Doctor' | 'Pharmacy';
}

export default function HospitalDashboard() {
    const [profile, setProfile] = useState<HospitalProfile | null>(null);
    const [qrInput, setQrInput] = useState('');
    const [patient, setPatient] = useState<PatientData | null>(null);
    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const { toast } = useToast();

    // Form states
    const [activeTab, setActiveTab] = useState('prescribe');
    const [medForm, setMedForm] = useState({
        name: '',
        dosage: '',
        time: '',
        instructions: '',
    });

    // Staff form
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [staffForm, setStaffForm] = useState({
        type: 'Doctor' as 'Doctor' | 'Pharmacy',
        name: '',
        email: '',
        specialty: '',
        location: '',
    });

    useEffect(() => {
        let isMounted = true;

        const initDashboard = async () => {
            try {
                console.log('🩺 HospitalDashboard: Initializing...');
                const res = await fetch('/api/hospital/me');
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || `Server returned ${res.status}`);
                }

                if (isMounted) {
                    console.log('✅ HospitalDashboard: Profile loaded', data.name);
                    setProfile(data);
                }

                // Fetch Staff separately
                const staffRes = await fetch('/api/hospital/staff');
                const staffData = await staffRes.json();
                if (staffRes.ok && isMounted) {
                    const combinedStaff: StaffMember[] = [
                        ...staffData.doctors.map((d: any) => ({ ...d, type: 'Doctor' })),
                        ...staffData.pharmacies.map((p: any) => ({ ...p, type: 'Pharmacy' }))
                    ];
                    setStaff(combinedStaff);
                }
            } catch (err: any) {
                console.error("❌ HospitalDashboard: Initialization failed", err);
                if (isMounted) {
                    toast({
                        title: "Console Error",
                        description: err.message || "Failed to load hospital data",
                        variant: "destructive"
                    });
                }
            }
        };

        initDashboard();
        return () => { isMounted = false; };
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/hospital/staff');
            const data = await res.json();
            if (res.ok) {
                const combinedStaff: StaffMember[] = [
                    ...data.doctors.map((d: any) => ({ ...d, type: 'Doctor' })),
                    ...data.pharmacies.map((p: any) => ({ ...p, type: 'Pharmacy' }))
                ];
                setStaff(combinedStaff);
            }
        } catch (error) {
            console.error("Failed to fetch staff", error);
        }
    };

    const handleScan = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!qrInput) return;

        setLoading(true);
        try {
            const res = await fetch('/api/hospital/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: qrInput }),
            });
            const data = await res.json();

            if (res.ok) {
                setPatient(data.patient);
                toast({ title: "Patient Found", description: `Loaded record for ${data.patient.name}` });
            } else {
                toast({ title: "Scan Failed", description: data.error, variant: "destructive" });
                setPatient(null);
            }
        } catch (error) {
            toast({ title: "Error", description: "Network error", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'prescribe' | 'dispense') => {
        if (!patient) return;
        setLoading(true);
        try {
            const endpoint = action === 'prescribe' ? '/api/hospital/prescribe' : '/api/hospital/dispense';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: patient.id,
                    ...medForm
                }),
            });
            const data = await res.json();

            if (res.ok) {
                toast({ title: "Success", description: data.message });
                setMedForm({ name: '', dosage: '', time: '', instructions: '' });
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Operation failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/hospital/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffForm),
            });
            const data = await res.json();
            if (res.ok) {
                toast({ title: "Success", description: `${staffForm.type} added successfully` });
                setIsStaffModalOpen(false);
                setStaffForm({ type: 'Doctor', name: '', email: '', specialty: '', location: '' });
                fetchStaff();
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to add staff", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (!profile) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
            <p className="text-slate-500 font-medium animate-pulse">Initializing hospital console...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            {/* Header / Banner */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-lg space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-blue-200" />
                            <h1 className="text-2xl sm:text-3xl font-bold font-headline">{profile.name}</h1>
                        </div>
                        <p className="opacity-80 text-sm sm:text-base flex items-center gap-2 capitalize">
                            <Shield className="h-4 w-4" /> Hospital Console • {(profile.roles || []).join(', ') || 'Staff Account'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="operations" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-white border border-slate-200 shadow-sm p-1 rounded-full overflow-hidden">
                    <TabsTrigger value="operations" className="rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                        <Activity className="w-4 h-4 mr-2" /> Operations
                    </TabsTrigger>
                    <TabsTrigger value="staff" className="rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                        <Users className="w-4 h-4 mr-2" /> Staff Management
                    </TabsTrigger>
                </TabsList>

                {/* Operations Tab: Scanner & Patient Records */}
                <TabsContent value="operations" className="space-y-6">
                    {!patient ? (
                        <div className="max-w-2xl mx-auto mt-8">
                            <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
                                <CardContent className="pt-12 pb-12 text-center space-y-6">
                                    <div className="mx-auto w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center shadow-inner">
                                        <QrCode className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-slate-900">Scan Patient QR</h2>
                                        <p className="text-slate-500 max-w-xs mx-auto">Enter the secure emergency token from the patient's ID to unlock their electronic health record.</p>
                                    </div>
                                    <form onSubmit={handleScan} className="max-w-sm mx-auto flex gap-2">
                                        <Input
                                            placeholder="Enter Token (e.g. 550e8400...)"
                                            className="bg-white border-blue-200 text-center font-mono focus:ring-blue-500"
                                            value={qrInput}
                                            onChange={(e) => setQrInput(e.target.value)}
                                        />
                                        <Button className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                            {loading ? '...' : 'Unlock'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Patient Info Sidebar */}
                            <div className="lg:col-span-4 space-y-6">
                                <Card className="overflow-hidden border-none shadow-soft-lg">
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={() => { setPatient(null); setQrInput(''); }}>
                                                <QrCode className="w-4 h-4 mr-2" /> New Scan
                                            </Button>
                                            <Badge className="bg-white/20 text-white border-none italic">Verified Record</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-white">
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                                <User className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl">{patient.name}</h3>
                                                <p className="text-sm opacity-80 uppercase tracking-wider">Patient Details</p>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-rose-50 p-4 rounded-xl text-center border border-rose-100">
                                                <span className="text-[10px] text-rose-500 uppercase font-bold tracking-widest block mb-1">Blood Type</span>
                                                <span className="text-2xl font-black text-rose-700">{patient.bloodGroup}</span>
                                            </div>
                                            <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                                                <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest block mb-1">System Status</span>
                                                <span className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Secure
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-slate-400 text-xs uppercase font-bold tracking-widest flex items-center gap-2">
                                                    <AlertTriangle className="w-3 h-3 text-amber-500" /> Critical Allergies
                                                </Label>
                                                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-900 text-sm font-medium">
                                                    {patient.allergies}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-400 text-xs uppercase font-bold tracking-widest flex items-center gap-2">
                                                    <Pill className="w-3 h-3 text-blue-500" /> Current Medications
                                                </Label>
                                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-900 text-sm italic">
                                                    {patient.medications}
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-100">
                                                <Label className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-2 block">Emergency Contact</Label>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                                                        <Users className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-700">{patient.emergencyContact}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Clinical Actions */}
                            <div className="lg:col-span-8">
                                <Card className="border-none shadow-soft-lg h-full">
                                    <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                                        <CardTitle className="text-xl">Clinical Intervention</CardTitle>
                                        <CardDescription>Issue prescriptions or dispense medications for {patient.name}.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Tabs defaultValue={(profile.roles || []).includes('pharmacy') && !(profile.roles || []).includes('doctor') ? 'dispense' : 'prescribe'} className="w-full">
                                            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100/50">
                                                <TabsTrigger value="prescribe" disabled={!(profile.roles || []).includes('doctor')}>
                                                    <Stethoscope className="w-4 h-4 mr-2" /> Prescribe (MD)
                                                </TabsTrigger>
                                                <TabsTrigger value="dispense" disabled={!(profile.roles || []).includes('pharmacy')}>
                                                    <Droplet className="w-4 h-4 mr-2" /> Dispense (Rx)
                                                </TabsTrigger>
                                            </TabsList>

                                            <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-100 space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label>Medicine Name</Label>
                                                        <Input
                                                            placeholder="e.g. Paracetamol"
                                                            value={medForm.name}
                                                            onChange={e => setMedForm({ ...medForm, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Dosage</Label>
                                                        <Input
                                                            placeholder="e.g. 500mg"
                                                            value={medForm.dosage}
                                                            onChange={e => setMedForm({ ...medForm, dosage: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Time/Frequency</Label>
                                                        <Input
                                                            placeholder="e.g. 8 AM / Once daily"
                                                            value={medForm.time}
                                                            onChange={e => setMedForm({ ...medForm, time: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Route/Method</Label>
                                                        <Select>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Oral (Tablet)" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="oral">Oral (Tablet/Liquid)</SelectItem>
                                                                <SelectItem value="injection">Injection</SelectItem>
                                                                <SelectItem value="topical">Topical (Cream)</SelectItem>
                                                                <SelectItem value="other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Special Instructions</Label>
                                                    <Textarea
                                                        placeholder="e.g. Take after meals, skip if fever subsides"
                                                        rows={3}
                                                        value={medForm.instructions}
                                                        onChange={e => setMedForm({ ...medForm, instructions: e.target.value })}
                                                    />
                                                </div>

                                                <TabsContent value="prescribe">
                                                    <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg py-6" onClick={() => handleAction('prescribe')} disabled={loading}>
                                                        {loading ? 'Processing Prescription...' : 'Confirm & Issue Prescription'}
                                                    </Button>
                                                </TabsContent>
                                                <TabsContent value="dispense">
                                                    <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 shadow-lg py-6" onClick={() => handleAction('dispense')} disabled={loading}>
                                                        {loading ? 'Confirming Dispense...' : 'Mark as Dispensed & Update Tracker'}
                                                    </Button>
                                                </TabsContent>
                                            </div>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* Staff Management Tab */}
                <TabsContent value="staff" className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-slate-900">Medical Staff & Units</h2>
                            <p className="text-sm text-slate-500">Manage doctor and pharmacy credentials linked to this hospital.</p>
                        </div>
                        <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-full">
                                    <UserPlus className="w-4 h-4 mr-2" /> Add Staff Member
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Clinical Staff</DialogTitle>
                                    <DialogDescription>Assign a new doctor or pharmacy unit to your hospital profile.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddStaff} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>Account Type</Label>
                                        <Select
                                            value={staffForm.type}
                                            onValueChange={(v: any) => setStaffForm({ ...staffForm, type: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Doctor">Doctor / Physician</SelectItem>
                                                <SelectItem value="Pharmacy">Pharmacy Unit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Full Name / Unit Name</Label>
                                        <Input
                                            placeholder={staffForm.type === 'Doctor' ? 'Dr. John Smith' : 'Inner-city Pharmacy'}
                                            required
                                            value={staffForm.name}
                                            onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                                        />
                                    </div>
                                    {staffForm.type === 'Doctor' ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Staff Email (LoginID)</Label>
                                                <Input
                                                    type="email"
                                                    placeholder="john@hospital.com"
                                                    required
                                                    value={staffForm.email}
                                                    onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Specialty</Label>
                                                <Input
                                                    placeholder="e.g. Cardiology"
                                                    value={staffForm.specialty}
                                                    onChange={e => setStaffForm({ ...staffForm, specialty: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label>Building / Location</Label>
                                            <Input
                                                placeholder="e.g. Wing B, Floor 2"
                                                value={staffForm.location}
                                                onChange={e => setStaffForm({ ...staffForm, location: e.target.value })}
                                            />
                                        </div>
                                    )}
                                    <DialogFooter className="pt-4">
                                        <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
                                            {loading ? 'Creating...' : 'Create Staff Profile'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {staff.length === 0 ? (
                            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl border-slate-200">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="font-bold text-slate-800">No staff members listed</h3>
                                <p className="text-slate-500 mb-6">Start growing your team by adding your first unit.</p>
                                <Button variant="outline" onClick={() => setIsStaffModalOpen(true)}>Add First Member</Button>
                            </div>
                        ) : staff.map(member => (
                            <Card key={member._id} className="border-none shadow-soft hover:shadow-soft-lg transition-all group overflow-hidden">
                                <CardContent className="p-5 flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${member.type === 'Doctor' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {member.type === 'Doctor' ? <Stethoscope className="w-6 h-6" /> : <Droplet className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start">
                                            <Badge className={member.type === 'Doctor' ? 'bg-blue-50 text-blue-600 border-none mb-1' : 'bg-emerald-50 text-emerald-600 border-none mb-1'}>
                                                {member.type}
                                            </Badge>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-slate-900 truncate">{member.name}</h4>
                                        <p className="text-xs text-slate-500 truncate mt-1">
                                            {member.type === 'Doctor' ? (member.specialty || 'General') : (member.location || 'Main Hospital')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
