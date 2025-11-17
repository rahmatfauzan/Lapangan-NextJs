import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle, Target, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    remainingSlots: number;
    totalRevenue: number;
  };
  pricePerSlot: number;
}

export function StatsCards({ stats, pricePerSlot }: StatsCardsProps) {
  const cards = [
    {
      icon: CheckCircle2,
      label: "Disetujui",
      value: stats.approvedCount,
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      icon: Clock,
      label: "Pending",
      value: stats.pendingCount,
      bgColor: "bg-amber-100",
      textColor: "text-amber-600",
    },
    {
      icon: XCircle,
      label: "Ditolak",
      value: stats.rejectedCount,
      bgColor: "bg-rose-100",
      textColor: "text-rose-600",
    },
    {
      icon: Target,
      label: "Slot Sisa",
      value: stats.remainingSlots,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <motion.div
          key={card.label}
          whileHover={{ y: -2 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 ${card.bgColor} rounded-lg`}>
              <card.icon className={`w-5 h-5 ${card.textColor}`} />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {card.value}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600">{card.label}</p>
        </motion.div>
      ))}

      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all col-span-2 lg:col-span-1"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-xs font-medium text-white/80 mb-1">Total Revenue</p>
        <p className="text-xl font-bold text-white">
          {formatPrice(stats.totalRevenue)}
        </p>
      </motion.div>
    </div>
  );
}