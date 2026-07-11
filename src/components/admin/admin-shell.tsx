"use client";

import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Suspense fallback={null}>
          <AdminSidebar isAdmin={isAdmin} />
        </Suspense>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
