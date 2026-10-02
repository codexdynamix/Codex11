import { lazy, Suspense, useEffect, useState } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { MemoryRouter, Route as ReactRouterRoute, Routes } from "react-router-dom";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ContactModalProvider } from "@/context/ContactModalContext";
import { Toaster } from "sonner";
import { TidioWidget } from "@/components/TidioWidget";
import { GlobalVisitorTracker } from "@/components/GlobalVisitorTracker";

const CodexDynamicsAdminApp = lazy(() => import("@/crm/admin-app/App.jsx"));
const ClientPortalApp = lazy(() => import("@/portal/ClientPortalApp").then(m => ({ default: m.ClientPortalApp })));

export function RootShell() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const isAdminPath = mounted && pathname.startsWith("/admin");
  const isPortalPath = mounted && pathname.startsWith("/portal");
  const relativePath = pathname.startsWith("/admin") ? pathname.slice("/admin".length) || "/" : "/";
  const initialEntry = `${relativePath}${typeof window !== "undefined" ? window.location.search : ""}`;

  return (
    <ThemeProvider>
      <ContactModalProvider>
        <SiteConfigProvider>
          <GlobalVisitorTracker />
          <TidioWidget />
          {isAdminPath ? (
            <Suspense fallback={<div role="status" aria-live="polite">Loading CRM…</div>}>
              <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                  <ReactRouterRoute path="/*" element={<CodexDynamicsAdminApp />} />
                </Routes>
              </MemoryRouter>
            </Suspense>
          ) : isPortalPath ? (
            <Suspense fallback={<div role="status" aria-live="polite" className="min-h-screen bg-[#0E1116] flex items-center justify-center text-white text-xs">Loading Portal…</div>}>
              <ClientPortalApp />
            </Suspense>
          ) : (
            <Outlet />
          )}
          <Toaster
            position="top-center"
            offset={56}
            toastOptions={{
              style: {
                background: "var(--color-popover)",
                border: "1px solid var(--color-hairline)",
                color: "var(--color-label)",
                borderRadius: "12px",
              },
            }}
          />
        </SiteConfigProvider>
      </ContactModalProvider>
    </ThemeProvider>
  );
}

export const Route = createRootRoute({
  component: RootShell,
});
