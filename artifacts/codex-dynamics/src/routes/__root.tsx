import { useEffect, useState } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { MemoryRouter, Route as ReactRouterRoute, Routes } from "react-router-dom";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ContactModalProvider } from "@/context/ContactModalContext";
import CodexDynamicsAdminApp from "@/crm/admin-app/App.jsx";
import { Toaster } from "sonner";
import { TidioWidget } from "@/components/TidioWidget";
import { GlobalVisitorTracker } from "@/components/GlobalVisitorTracker";

export function RootShell() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const isAdminPath = mounted && pathname.startsWith("/admin");
  const relativePath = pathname.startsWith("/admin") ? pathname.slice("/admin".length) || "/" : "/";
  const initialEntry = `${relativePath}${typeof window !== "undefined" ? window.location.search : ""}`;

  return (
    <ThemeProvider>
      <ContactModalProvider>
        <SiteConfigProvider>
          <GlobalVisitorTracker />
          <TidioWidget />
          {isAdminPath ? (
            <MemoryRouter initialEntries={[initialEntry]}>
              <Routes>
                <ReactRouterRoute path="/*" element={<CodexDynamicsAdminApp />} />
              </Routes>
            </MemoryRouter>
          ) : (
            <Outlet />
          )}
          <Toaster
            position="top-center"
            offset={56}
            toastOptions={{
              style: {
                background: "var(--color-paper)",
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
