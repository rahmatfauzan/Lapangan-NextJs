import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MabarParticipant, MabarSession } from "@/types";
import { useAuth } from "@/context/AuthContext";

const getStatusDisplay = (status: string) => {
  switch (status) {
    case "approved":
      return {
        text: "✓ Disetujui",
        style: "bg-green-600/20 text-green-500 border-green-500/30",
      };
    case "waiting_payment":
      return {
        text: "⏳ Menunggu Bayar",
        style: "bg-yellow-600/20 text-yellow-500 border-yellow-500/30",
      };
    case "awaiting_approval":
      return {
        text: "⌛ Menunggu Konfirmasi",
        style: "bg-blue-600/20 text-blue-500 border-blue-500/30",
      };
    case "rejected":
      return {
        text: "❌ Ditolak",
        style: "bg-red-600/20 text-red-500 border-red-500/30",
      };
    default:
      return { text: "N/A", style: "bg-gray-600/20 text-gray-400" };
  }
};

const ParticipantsCard = ({
  mabar,
  participants_count,
  slot_total,
}: {
  mabar: MabarSession;
  participants_count: number;
  slot_total: number;
}) => {
  const { user } = useAuth();
  const participants = mabar.participants || [];
  return (
    <Card className="shadow-xl bg-card/95 backdrop-blur-sm border">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-linear-to-br from-green-500/20 to-emerald-500/10">
            <Users className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">Partisipan</div>
            <div className="text-sm font-normal text-muted-foreground">
              {participants_count} dari {slot_total} slot terisi
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {participants.length > 0 ? (
          <ScrollArea className="h-50 rounded-2xl">
            {participants.map((p) => {
              // 1. PINDAHKAN deklarasi ke dalam body fungsi map
              const { text, style } = getStatusDisplay(p.status);

              // Tentukan label Host/Member
              const isHost = mabar.host?.id === p.user_id;

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 my-4 rounded-xl bg-linear-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 transition-all border border-muted hover:border-muted-foreground/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-linear-to-br from-primary/20 to-blue-500/10 flex items-center justify-center ring-2 ring-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block">
                        {p.user?.name || "Anonim"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {/* Tampilkan label Host atau Member */}
                        {isHost ? "Host" : "Member"}
                      </span>
                    </div>
                  </div>

                  {/* 2. GUNAKAN 'text' dan 'style' yang sudah dihitung */}
                  <Badge
                    // Variant disesuaikan (default untuk sukses, secondary untuk yang lain)
                    variant={p.status === "approved" ? "default" : "secondary"}
                    className={`text-xs font-semibold ${style}`}
                  >
                    {text}
                  </Badge>
                </div>
              );
            })}
          </ScrollArea>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="inline-flex p-4 rounded-full bg-primary/5 mb-4">
              <Users className="h-12 w-12 text-primary/50" />
            </div>
            <p className="font-semibold text-foreground mb-1">
              Belum ada partisipan lain
            </p>
            <p className="text-sm text-muted-foreground">
              Jadilah yang pertama bergabung!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParticipantsCard;
