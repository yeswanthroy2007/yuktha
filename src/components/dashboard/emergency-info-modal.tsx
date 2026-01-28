
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useEmergencyInfo } from "@/context/emergency-info-context";
import { useAuth } from "@/context/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type EmergencyInfo } from "@/lib/data";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Other"];
const commonAllergies = ["Peanuts", "Shellfish", "Milk", "Eggs", "Penicillin", "Sulfa Drugs", "No known allergies", "Other"];
const commonMeds = ["Metformin", "Lisinopril", "Atorvastatin", "Amlodipine", "No current medications", "Other"];

type SelectableField = 'bloodGroup' | 'allergies' | 'medications';

export function EmergencyInfoModal() {
  const { emergencyInfo, setEmergencyInfo, isModalOpen, setIsModalOpen } = useEmergencyInfo();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState<EmergencyInfo>(emergencyInfo);
  const [hasFilledInfo, setHasFilledInfo] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check if user has completed emergency details
    if (user) {
      setHasFilledInfo(user.emergencyDetailsCompleted ?? true);
      // Auto-open modal if not completed
      if (!user.emergencyDetailsCompleted) {
        setIsModalOpen(true);
      }
    }
  }, [user, isModalOpen]);

  useEffect(() => {
    setFormData(emergencyInfo);
  }, [emergencyInfo, isModalOpen]);

  // Fetch emergency info from API on mount
  useEffect(() => {
    const fetchEmergencyInfo = async () => {
      try {
        const response = await fetch('/api/medical-info');
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setFormData({
              bloodGroup: data.data.bloodGroup || '',
              bloodGroupOther: data.data.bloodGroupOther || '',
              allergies: data.data.allergies || '',
              allergiesOther: data.data.allergiesOther || '',
              medications: data.data.medications || '',
              medicationsOther: data.data.medicationsOther || '',
              emergencyContact: data.data.emergencyContact || '',
            });
            setEmergencyInfo({
              bloodGroup: data.data.bloodGroup || '',
              bloodGroupOther: data.data.bloodGroupOther || '',
              allergies: data.data.allergies || '',
              allergiesOther: data.data.allergiesOther || '',
              medications: data.data.medications || '',
              medicationsOther: data.data.medicationsOther || '',
              emergencyContact: data.data.emergencyContact || '',
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch emergency info:', error);
      }
    };

    if (user) {
      fetchEmergencyInfo();
    }
  }, [user]);

  const handleSelectChange = (field: SelectableField) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      [`${field}Other`]: value === 'Other' ? prev[`${field}Other` as keyof EmergencyInfo] : ''
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    const { bloodGroup, bloodGroupOther, allergies, allergiesOther, medications, medicationsOther, emergencyContact } = formData;

    if (!bloodGroup ||
      (bloodGroup === 'Other' && !bloodGroupOther) ||
      !allergies ||
      (allergies === 'Other' && !allergiesOther) ||
      !medications ||
      (medications === 'Other' && !medicationsOther) ||
      !emergencyContact
    ) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill out all fields before saving.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/medical-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEmergencyInfo(formData);
        setHasFilledInfo(true);
        setIsModalOpen(false);

        // Refresh user data to get updated emergencyDetailsCompleted
        await refreshUser();

        toast({
          title: "Success!",
          description: "Your Emergency Medical File has been saved.",
        });
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to save emergency information.",
        });
      }
    } catch (error) {
      console.error('Error saving emergency info:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save emergency information. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} >
        <DialogContent className="sm:max-w-md" hideCloseButton={!hasFilledInfo}>
          <DialogHeader>
            <DialogTitle className="font-headline">Emergency Medical File</DialogTitle>
            <DialogDescription>
              Please fill out this vital information. It could be life-saving in an emergency and is required to generate your QR code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <div className="flex gap-2">
                <Select onValueChange={handleSelectChange('bloodGroup')} value={formData.bloodGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
                {formData.bloodGroup === 'Other' && (
                  <Input id="bloodGroupOther" value={formData.bloodGroupOther} onChange={handleInputChange} placeholder="Specify blood group" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <div className="flex gap-2">
                <Select onValueChange={handleSelectChange('allergies')} value={formData.allergies}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select allergies" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonAllergies.map(allergy => <SelectItem key={allergy} value={allergy}>{allergy}</SelectItem>)}
                  </SelectContent>
                </Select>
                {formData.allergies === 'Other' && (
                  <Input id="allergiesOther" value={formData.allergiesOther} onChange={handleInputChange} placeholder="Specify allergies" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="medications">Current Medications</Label>
              <div className="flex gap-2">
                <Select onValueChange={handleSelectChange('medications')} value={formData.medications}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medications" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonMeds.map(med => <SelectItem key={med} value={med}>{med}</SelectItem>)}
                  </SelectContent>
                </Select>
                {formData.medications === 'Other' && (
                  <Input id="medicationsOther" value={formData.medicationsOther} onChange={handleInputChange} placeholder="Specify medications" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" placeholder="Name - Phone Number" value={formData.emergencyContact} onChange={handleInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Information'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
