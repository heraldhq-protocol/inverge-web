"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { MobileNavigation } from "@/features/app-shell/components/product-navigation";
import { ProductFooter } from "@/features/app-shell/components/product-footer";
import { ProductHeader } from "@/features/app-shell/components/product-header";
import { ProductSidebar } from "@/features/app-shell/components/product-sidebar";
import { ProductTopbar } from "@/features/app-shell/components/product-topbar";
import type { ShellData } from "@/features/app-shell/types";

/**
 * The one authenticated shell.
 *
 * Dashboard home, Creator Studio, and every supporting surface share this frame
 * so the product reads as one application. Identity and unread counts arrive as
 * serialisable props from the server layout; nothing here decides permissions.
 */
export function AppShell({
  children,
  data,
}: {
  children: ReactNode;
  data: ShellData;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      className={`min-h-dvh bg-canvas lg:grid lg:transition-[grid-template-columns] lg:duration-200 lg:ease-out ${
        sidebarCollapsed
          ? "lg:grid-cols-[5rem_minmax(0,1fr)]"
          : "lg:grid-cols-[14.75rem_minmax(0,1fr)] xl:grid-cols-[15.5rem_minmax(0,1fr)]"
      }`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-contrast focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-brand"
      >
        Skip to content
      </a>
      <ProductSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
        unreadCount={data.unreadCount}
        viewer={data.viewer}
      />
      <div className="flex min-h-dvh min-w-0 flex-col">
        <ProductHeader data={data} />
        <ProductTopbar data={data} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <ProductFooter />
        <MobileNavigation unreadCount={data.unreadCount} />
      </div>
    </div>
  );
}
