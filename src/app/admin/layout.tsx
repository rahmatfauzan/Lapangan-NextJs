"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Navbar from "./navbar";
import { AdminSidebar } from "./sidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

function FullPageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Memeriksa sesi...</p>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isLoading && !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AuthProvider>
        <SidebarProvider>
          <AdminSidebar />
          <main className="flex-auto">
            <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
              </div>
              <Navbar />
            </div>
            <div className="">
              {children}
              <Toaster position="bottom-right" duration={3000} />
            </div>
          </main>
        </SidebarProvider>
      </AuthProvider>
    </div>
  );
}
