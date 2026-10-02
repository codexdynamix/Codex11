import React, { useState, useEffect } from 'react';
import { readPortalSession, setPortalSession } from '../services/portalAuth';
import { portalDb } from '../services/portalDatabase';
import { PortalShell } from './PortalShell';
import { PortalLogin } from './pages/PortalLogin';
import { PortalDashboard } from './pages/PortalDashboard';
import { PortalWebsites } from './pages/PortalWebsites';
import { PortalProjects } from './pages/PortalProjects';
import { PortalBilling } from './pages/PortalBilling';
import { PortalHosting } from './pages/PortalHosting';
import { PortalDomains } from './pages/PortalDomains';
import { PortalFiles } from './pages/PortalFiles';
import { PortalSupport } from './pages/PortalSupport';
import { PortalNotifications } from './pages/PortalNotifications';
import { PortalProfile } from './pages/PortalProfile';
import { PortalConnectorDemo } from './pages/PortalConnectorDemo';

export function ClientPortalApp() {
  const getInitialPath = () => {
    if (typeof window === 'undefined') return '/portal/dashboard';
    const path = window.location.pathname;
    if (path === '/portal' || path === '/portal/' || path === '/client' || path === '/client/') {
      return '/portal/dashboard';
    }
    return path.startsWith('/portal') ? path : '/portal/dashboard';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);
  const [session, setSession] = useState(() => readPortalSession());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/portal' || p === '/portal/' || p === '/client' || p === '/client/') {
        window.history.replaceState({}, '', '/portal/dashboard');
      }
    }

    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/portal' || path === '/portal/') {
        setCurrentPath('/portal/dashboard');
      } else if (path.startsWith('/portal')) {
        setCurrentPath(path);
      }
      setSession(readPortalSession());
    };

    window.addEventListener('popstate', handlePopState);
    const handleAuthChange = () => setSession(readPortalSession());
    window.addEventListener('cdx_portal_auth_changed', handleAuthChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('cdx_portal_auth_changed', handleAuthChange);
    };
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
    setSession(readPortalSession());
  };

  // If user is accessing login route or unauthenticated
  if (!session || currentPath === '/portal/login') {
    return (
      <PortalLogin
        onLoginSuccess={() => {
          navigate('/portal/dashboard');
        }}
      />
    );
  }

  // Render appropriate page inside PortalShell
  const renderPage = () => {
    if (currentPath === '/portal/websites') {
      return <PortalWebsites client={session.client} onNavigate={navigate} />;
    }
    if (currentPath === '/portal/projects') {
      return <PortalProjects client={session.client} onNavigate={navigate} />;
    }
    if (currentPath === '/portal/billing' || currentPath === '/portal/invoices') {
      return <PortalBilling client={session.client} onNavigate={navigate} />;
    }
    if (currentPath === '/portal/hosting') {
      return <PortalHosting client={session.client} onNavigate={navigate} />;
    }
    if (currentPath === '/portal/domains') {
      return <PortalDomains client={session.client} onNavigate={navigate} />;
    }
    if (currentPath === '/portal/files') {
      return <PortalFiles client={session.client} onNavigate={navigate} />;
    }
    if (currentPath === '/portal/support') {
      return <PortalSupport client={session.client} onNavigate={navigate} />;
    }
    if (currentPath === '/portal/notifications') {
      return <PortalNotifications client={session.client} onNavigate={navigate} />;
    }
    if (currentPath === '/portal/profile') {
      return <PortalProfile client={session.client} onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/portal/connector-demo')) {
      return <PortalConnectorDemo onNavigate={navigate} />;
    }
    // Default to Dashboard
    return <PortalDashboard client={session.client} onNavigate={navigate} />;
  };

  return (
    <PortalShell currentPath={currentPath} onNavigate={navigate}>
      {renderPage()}
    </PortalShell>
  );
}
