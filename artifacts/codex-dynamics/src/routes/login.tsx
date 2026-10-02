import { createFileRoute } from "@tanstack/react-router";
import { ClientLoginSplitView } from "@/components/ClientLoginSplitView";

export const Route = createFileRoute("/login")({
  component: LoginRouteComponent,
});

function LoginRouteComponent() {
  return (
    <ClientLoginSplitView
      onClose={() => {
        window.location.assign("/");
      }}
      onSuccess={() => {
        window.location.assign("/portal/dashboard");
      }}
    />
  );
}
