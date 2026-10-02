import { createFileRoute } from "@tanstack/react-router";
import { PortalLogin } from "@/portal/pages/PortalLogin";

export const Route = createFileRoute("/login")({
  component: LoginRouteComponent,
});

function LoginRouteComponent() {
  return (
    <PortalLogin
      onLoginSuccess={() => {
        window.location.assign("/portal/dashboard");
      }}
    />
  );
}
