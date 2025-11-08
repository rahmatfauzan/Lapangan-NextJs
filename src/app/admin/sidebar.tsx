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
      active: String(location).startsWith("/admin/dashboard") ? true : false,
      icon: LayoutDashboard,
    },
    {
      title: "Pengguna",
      url: "/admin/users",
      active: String(location).startsWith("/admin/users") ? true : false,
      icon: Users,
    },
    {
      title: "Lapangan",
      url: "/admin/fields",
      active: String(location).startsWith("/admin/fields") ? true : false,
      icon: RectangleHorizontal,
    },
    {
      title: "Kategori Olahraga",
      url: "/admin/category",
      active: String(location).startsWith("/admin/category") ? true : false,
      icon: Tags,
    },
    {
      title: "Booking",
      url: "/admin/booking",
      active: String(location).startsWith("/admin/booking") ? true : false,
      icon: BookOpenCheck,
    },
    {
      title: "Sesi Mabar",
      url: "/admin/mabar",
      active: String(location).startsWith("/admin/mabar") ? true : false,
      icon: MessagesSquare,
    },
    {
      title: "Pengaturan",
      url: "/admin/settings",
      active: String(location).startsWith("/admin/settings") ? true : false,
      icon: Settings,
    },
  ];

  return (
    <Sidebar className="">
      <SidebarHeader className="m-2">
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
