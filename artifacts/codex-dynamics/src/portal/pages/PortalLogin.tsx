import React from 'react';
import { ClientLoginSplitView } from '@/components/ClientLoginSplitView';

interface PortalLoginProps {
  onLoginSuccess: () => void;
}

export function PortalLogin({ onLoginSuccess }: PortalLoginProps) {
  return (
    <ClientLoginSplitView
      onClose={() => {
        window.location.assign('/');
      }}
      onSuccess={onLoginSuccess}
    />
  );
}
