"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <DashboardSidebar pathname={pathname} />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
