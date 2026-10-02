/**
 * portalAuth.ts
 *
 * Dedicated authentication and session service for the Codex Dynamics Client Portal.
 * Handles client login, session validation, token storage, and client isolation guards.
 */

import { portalDb, type PortalClient } from './portalDatabase';

const PORTAL_TOKEN_KEY = 'cdx_portal_session_token_v2';
const PORTAL_USER_KEY = 'cdx_portal_session_client_v2';

export interface PortalSession {
  token: string;
  client: PortalClient;
  loginTime: number;
}

export function readPortalSession(): PortalSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem(PORTAL_TOKEN_KEY);
    const raw = localStorage.getItem(PORTAL_USER_KEY);
    if (!token || !raw) return null;
    const client = JSON.parse(raw) as PortalClient;
    // Verify client still exists and is enabled in the database
    const freshClient = portalDb.getClientById(client.id);
    if (!freshClient || !freshClient.portalEnabled || freshClient.status !== 'Active') {
      clearPortalSession();
      return null;
    }
    return {
      token,
      client: freshClient,
      loginTime: Date.now(),
    };
  } catch (e) {
    clearPortalSession();
    return null;
  }
}

export function setPortalSession(client: PortalClient): PortalSession {
  const token = `cdx_sess_${client.id}_${Date.now()}`;
  const session: PortalSession = {
    token,
    client,
    loginTime: Date.now(),
  };

  try {
    localStorage.setItem(PORTAL_TOKEN_KEY, token);
    localStorage.setItem(PORTAL_USER_KEY, JSON.stringify(client));
    // Also sync with legacy keys for backwards-compatibility with old /client route
    localStorage.setItem('codex_client_token', token);
    localStorage.setItem('codex_client_user', JSON.stringify({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      country: client.country,
      status: client.status,
    }));
    window.dispatchEvent(new CustomEvent('cdx_portal_auth_changed', { detail: session }));
  } catch (e) {
    console.error('[portalAuth] failed to write session', e);
  }

  // Update last login in database
  portalDb.adminUpdateClient(client.id, {
    lastLoginAt: new Date().toISOString(),
  });
  portalDb.logAudit(client.id, client.name, 'CLIENT_LOGIN', `Client signed into Client Portal successfully`);

  return session;
}

export function clearPortalSession(): void {
  try {
    const session = readPortalSession();
    if (session) {
      portalDb.logAudit(session.client.id, session.client.name, 'CLIENT_LOGOUT', 'Client signed out of Client Portal');
    }
    localStorage.removeItem(PORTAL_TOKEN_KEY);
    localStorage.removeItem(PORTAL_USER_KEY);
    localStorage.removeItem('codex_client_token');
    localStorage.removeItem('codex_client_user');
    window.dispatchEvent(new CustomEvent('cdx_portal_auth_changed', { detail: null }));
  } catch (_) {}
}

/**
 * Authenticates client credentials.
 * Throws human-readable Error if invalid or disabled.
 */
export async function portalLogin(email: string, password?: string): Promise<PortalClient> {
  const cleanEmail = email.toLowerCase().trim();
  const client = portalDb.getClientByEmail(cleanEmail);

  if (!client) {
    throw new Error('No client account found with this email address. Please check your spelling or contact your Codex Dynamics account manager.');
  }

  if (!client.portalEnabled || client.status !== 'Active') {
    throw new Error('This client portal account is currently disabled or suspended. Please contact Codex Dynamics support.');
  }

  // In production, compare hashed passwords. If password is provided, verify.
  if (client.password && password && client.password !== password) {
    throw new Error('Incorrect password. Please try again or use direct login assistance.');
  }

  setPortalSession(client);
  return client;
}
