import { MemoryRouter, Route as ReactRouterRoute, Routes } from "react-router-dom";
import CodexDynamicsAdminApp from "./App.jsx";

export function AdminRouteShell() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/admin";
  const relativePath = pathname.startsWith("/admin") ? pathname.slice("/admin".length) || "/" : "/";
  const search = typeof window !== "undefined" ? window.location.search : "";
  const initialEntry = `${relativePath}${search}`;

  return (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <ReactRouterRoute path="/*" element={<CodexDynamicsAdminApp />} />
      </Routes>
    </MemoryRouter>
  );
}