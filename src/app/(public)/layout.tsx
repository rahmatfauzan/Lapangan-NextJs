import { AuthProvider } from "@/context/AuthContext";
import Navbar from "./navbar";
import { Toaster } from "@/components/ui/sonner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Toaster position="bottom-right" duration={3000} />
    </>
  );
}
