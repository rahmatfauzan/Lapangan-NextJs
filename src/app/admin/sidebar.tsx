"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  RectangleHorizontal,
  Tags,
  Trophy,
  BookOpenCheck,
  MessagesSquare,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const location = usePathname();
  const items = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      active: location === "/admin/dashboard" ? true : false,
      icon: LayoutDashboard,
    },
    {
      title: "Pengguna",
      url: "/admin/users",
      active: location === "/admin/users" ? true : false,
      icon: Users,
    },
    {
      title: "Lapangan",
      url: "/admin/fields",
      active: location === "/admin/fields" ? true : false,
      icon: RectangleHorizontal,
    },
    {
      title: "Kategori Olahraga",
      url: "/admin/sport-categories",
      active: location === "/admin/sport-categories" ? true : false,
      icon: Tags,
    },
    {
      title: "Event Resmi",
      url: "/admin/events",
      active: location === "/admin/events" ? true : false,
      icon: Trophy,
    },
    {
      title: "Booking",
      url: "/admin/bookings",
      active: location === "/admin/bookings" ? true : false,
      icon: BookOpenCheck,
    },
    {
      title: "Sesi Mabar",
      url: "/admin/mabar-sessions",
      active: location === "/admin/mabar-sessions" ? true : false,
      icon: MessagesSquare,
    },
    {
      title: "Pengaturan",
      url: "/admin/settings",
      active: location === "/admin/settings" ? true : false,
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center w-full gap-3">
          <Avatar className="rounded-lg cursor-pointer">
            <AvatarImage
              src="https://github.com/evilrabbit.png"
              alt="@evilrabbit"
            />
            <AvatarFallback>ER</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-md font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage your site</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manajemen</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton size="lg" asChild isActive={item.active}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
