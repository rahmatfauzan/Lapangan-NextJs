import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Users } from "lucide-react";
import { MabarSession } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah, getParticipantStatus } from "@/lib/utils";

const JoinCard = ({ mabar }: { mabar: MabarSession }) => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const userStatus = mabar
    ? getParticipantStatus(mabar, currentUserId)
    : { isHost: false, status: "NOT_JOINED" };
  const slotsAvailable = mabar.slots_total - mabar.participants_count;
  const isFull = slotsAvailable <= 0;
  const isConfirmed = mabar.booking?.booked_status === "active";
  console.log("isConfirmed", isConfirmed);
  let buttonText = "Gabung Sesi Mabar";
  let buttonDisabled = isFull || !isConfirmed;
  let infoBox = null;
  console.log(userStatus);
  if (!isConfirmed) {
    buttonText = "Belum Bisa Bergabung"; // Belum bisa gabung
    buttonDisabled = true;
    infoBox = {
      type: "warning",
      text: "Mabar belum dikonfirmasi oleh admin.",
    };
  } else if (userStatus.isHost) {
    buttonText = "Lihat Detail Hosting";
    buttonDisabled = false;
    infoBox = {
      type: "host_success",
      title: "Anda Adalah Host",
      text: "Kelola partisipan Anda di menu ini.",
    };
  } else {
    switch (userStatus.status) {
      case "approved":
        buttonText = "Anda Sudah Terdaftar";
        buttonDisabled = true;
        infoBox = {
          type: "success",
          title: "Slot Diamankan",
          text: "Sampai jumpa di lapangan!",
        };
        break;
      case "waiting_payment":
        buttonText = "Upload Bukti Bayar";
        buttonDisabled = false;
        infoBox = {
          type: "warning",
          title: "Pembayaran Tertunda",
          text: "Anda belum menyelesaikan pembayaran slot Anda.",
        };
        break;
      case "awaiting_approval":
        buttonText = "Menunggu Konfirmasi Admin";
        buttonDisabled = true;
        infoBox = {
          type: "info",
          title: "Verifikasi Bukti",
          text: "Bukti bayar Anda sedang diverifikasi.",
        };
        break;
      case "NOT_JOINED":
        buttonText = "Gabung Sesi Mabar";
        buttonDisabled = false;
        break;
      default:
        buttonText = isFull ? "Sesi Penuh" : "Belum Bisa Bergabung Sesi Mabar";
        buttonDisabled = isFull ? true : false;
    }
  }
  let buttonClasses = "";
  if (userStatus.status === "approved") {
    buttonClasses =
      "bg-gradient-to-r from-green-600 to-teal-600 shadow-lg shadow-green-500/30 hover:bg-gradient-to-r hover:from-green-700 hover:to-teal-700 hover:shadow-green-500/40";
  } else if (userStatus.status === "awaiting_approval") {
    //  WAITING PAYMENT / UPLOAD BUKTI - Harus menonjolkan aksi yang tersisa
    buttonClasses =
      "bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/30 hover:bg-gradient-to-r hover:from-red-700 hover:to-pink-700 hover:shadow-red-500/40";
  } else if (userStatus.status === "waiting_payment") {
    //  WAITING PAYMENT / UPLOAD BUKTI - Harus menonjolkan aksi yang tersisa
    buttonClasses =
      "bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg shadow-amber-500/30 hover:bg-gradient-to-r hover:from-amber-700 hover:to-orange-700 hover:shadow-amber-500/40";
  } else if (userStatus.status === "NOT_JOINED") {
    //  AKSI JOIN UTAMA
    buttonClasses =
      "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40";
  }
  const handleJoinClick = () => {
    alert(`Aksi: Bergabung ke ${mabar.title} (ID: ${mabar.id})`);
  };

  return (
    <Card className="border shadow-xl bg-card/95 backdrop-blur-sm">
      <CardContent className="pt-6 space-y-6">
        <div className="text-center space-y-2 pb-6 border-b border-primary/20">
          <div className="space-y-1">
            <p className="lg:text-4xl text-5xl xl:text-5xl font-black bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              {formatRupiah(mabar.price_per_slot) || "GRATIS"}
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              Biaya per Orang
            </p>
          </div>
        </div>

        <div className="text-center space-y-3 pb-6 border-b border-primary/20">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-green-500/20 to-emerald-500/10 justify-center">
              <Users className="h-6 w-6 text-green-500" />
              <span className="text-4xl font-black bg-linear-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                {isFull ? "0" : mabar.slots_total - slotsAvailable}
              </span>
            </div>
            <span className="text-2xl text-muted-foreground font-light">/</span>
            <span className="text-3xl font-bold text-muted-foreground">
              {mabar.slots_total}
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-semibold">
            {isFull ? "🔴 Slot Penuh" : "🟢 Slot Tersedia"}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className={`w-full text-lg py-6 font-bold text-white transition-all duration-300 ${buttonClasses}`}
            disabled={buttonDisabled}
            onClick={!buttonDisabled ? handleJoinClick : undefined}
          >
            {buttonText}
          </Button>

          {infoBox && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg ${
                infoBox.type === "warning"
                  ? "bg-orange-500/10 border border-orange-500/20"
                  : infoBox.type === "success"
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-blue-500/10 border border-blue-500/20"
              }`}
            >
              <AlertCircle
                className={`h-5 w-5 mt-0.5 ${
                  infoBox.type === "warning"
                    ? "text-orange-500"
                    : infoBox.type === "success"
                    ? "text-green-500"
                    : "text-blue-500"
                }`}
              />
              <p
                className={`text-sm ${
                  infoBox.type === "warning" ? "text-orange-500" : ""
                }`}
              >
                {infoBox.text}
              </p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-primary/20 space-y-3">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-linear-to-r from-blue-500 to-purple-500" />
            Instruksi Pembayaran
          </h4>
          <div className="p-4 rounded-xl bg-linear-to-br from-muted/70 to-muted/40 border border-muted">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {mabar.payment_instructions || "Tidak ada instruksi khusus."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JoinCard;
