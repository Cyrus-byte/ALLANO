
"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect to home and show a message, or a dedicated "access denied" page
    router.replace('/');
    // You might want to show a toast message here
    return (
         <div className="flex h-screen w-screen items-center justify-center">
            <p>Accès refusé.</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 bg-muted/20">
        {children}
      </main>
    </div>
  );
}
