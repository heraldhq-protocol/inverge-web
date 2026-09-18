"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { MobileNavigation } from "@/features/app-shell/components/product-navigation";
import { ProductFooter } from "@/features/app-shell/components/product-footer";
import { ProductHeader } from "@/features/app-shell/components/product-header";
import { ProductSidebar } from "@/features/app-shell/components/product-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      className={`min-h-dvh bg-canvas lg:grid lg:transition-[grid-template-columns] lg:duration-300 lg:ease-out ${
        sidebarCollapsed
          ? "lg:grid-cols-[6.5rem_minmax(0,1fr)]"
          : "lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]"
      }`}
    >
      <ProductSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
      />
      <div className="flex min-h-dvh min-w-0 flex-col">
        <ProductHeader />
        <main className="flex-1">{children}</main>
        <ProductFooter />
        <MobileNavigation />
      </div>
    </div>
  );
}
