'use client';

import {
    Building2,
    LayoutDashboard,
    LogOut,
    QrCode,
    Stethoscope,
    Pill,
    Users
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/auth-context"; // We might need a separate auth context for hospital or reuse custom logic

export function HospitalSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    // Note: Standard useAuth might be for Users. 
    // For now we assume session handling is via cookies/middleware and local state if needed.

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/hospital/login');
        } catch (error) {
            console.error('Logout failed', error);
            router.push('/hospital/login');
        }
    };

    const menuItems = [
        {
            title: "Scanner",
            url: "/hospital/dashboard",
            icon: QrCode,
        },
        // We can add filtered views or history later
    ];

    return (
        <>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2 px-4 py-2">
                        <div className="bg-blue-600 text-white p-1 rounded-md">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-lg text-blue-950">Hospital Portal</span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Operations</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.url}
                                            className={pathname === item.url ? "bg-blue-50 text-blue-900 font-medium" : "text-slate-600"}
                                        >
                                            <a href={item.url}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => setShowLogoutDialog(true)}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sign Out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sign Out?</AlertDialogTitle>
                        <AlertDialogDescription>
                            End your hospital session?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
