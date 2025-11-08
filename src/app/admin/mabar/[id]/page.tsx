"use client";
import React, { useEffect } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  Share2,
  BookmarkPlus,
} from "lucide-react";
import { toast } from "sonner";
import { getMabarSession } from "@/lib/services/mabar.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import DetailCard from "./card/detail";
import JoinCard from "./card/join";
import ParticipantsCard from "./card/patisipan";

export default function MabarDetailFetcher() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const mabarId = Array.isArray(params.id) ? params.id[0] : params.id;
 const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Mabar", href: "admin/mabar" },
    { label: "Create" },
  ];
  const {
    data: mabar,
    error,
    isLoading,
  } = useSWR(mabarId ? ["mabar", mabarId] : null, () =>
    getMabarSession(mabarId as string)
  );
  

  useEffect(() => {
    if (!isLoading && (error || !mabar)) {
      toast.error("Gagal Memuat Sesi", {
        description:
          "Sesi mabar tidak ditemukan atau terjadi kesalahan. Mengarahkan kembali...",
      });
      setTimeout(() => {
        router.back();
      }, 1500);
    }
  }, [error, mabar, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium text-muted-foreground">
            Memuat detail sesi mabar...
          </p>
        </div>
      </div>
    );
  }

  if (error || !mabar) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <p className="text-lg text-destructive">Mengarahkan kembali...</p>
        </div>
      </div>
    );
  }

  const isConfirmed = mabar.booking?.booked_status === "active"; // Booking Host sudah lunas?
  console.log("booking", mabar);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      <div className="relative h-[300px] w-full overflow-hidden">
        {mabar.cover_image ? (
          <Image
            src={mabar.cover_image}
            alt={`Cover ${mabar.title}`}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
            <CheckCircle className="h-32 w-32 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
        <div className="absolute top-6 left-6">
          <Badge
            variant={isConfirmed ? "default" : "secondary"}
            className="text-sm px-4 py-2 shadow-lg backdrop-blur-sm"
          >
            {isConfirmed ? "Open" : "Close"}
            <CheckCircle className="h-4 w-4 mr-2" />
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 relative pb-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <DetailCard mabar={mabar} />
            {mabar.participants && (
              <ParticipantsCard
                mabar={mabar}
                participants_count={mabar.participants_count}
                slot_total={mabar.slots_total}
              />
            )}
          </div>
          <JoinCard mabar={mabar} />
        </div>
      </div>
    </div>
  );
}
