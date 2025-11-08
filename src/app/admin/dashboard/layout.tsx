"use client";
import { Children } from "react";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="m-10">{children}</div>;
}
