import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import JSZip from 'jszip';
import { getSqliteDb } from './sqliteDb';

let phpProcess: any = null;

function ensurePhpServer() {
  if (phpProcess) return;
  const serverDir = import.meta.dirname || __dirname;
  const apiDir = path.resolve(serverDir, '../../public/api');
  const indexPhp = path.join(apiDir, 'index.php');

  try {
    phpProcess = spawn('php', ['-S', '127.0.0.1:8080', '-t', apiDir, indexPhp], {
      stdio: 'ignore',
      detached: false,
    });
    phpProcess.on('error', () => {
      phpProcess = null;
    });
    phpProcess.on('exit', () => {
      phpProcess = null;
    });
  } catch (_) {
    phpProcess = null;
  }
}

export function crmApiPlugin(): Plugin {
  return {
    name: 'codex-crm-api-plugin',
    configureServer(server) {
      ensurePhpServer();

      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) {
          return next();
        }

        const parsedUrl = new URL(url, 'http://localhost:3000');
        const pathname = parsedUrl.pathname;
        const method = req.method || 'GET';

        // Parse JSON Body
        let body: any = {};
        if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
          try {
            const buffers: Buffer[] = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const data = Buffer.concat(buffers).toString();
            if (data.trim()) {
              body = JSON.parse(data);
            }
          } catch (_) {
            body = {};
          }
        }

        const sendJson = (data: any, status = 200, engine = 'Embedded-SQLite') => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.setHeader('X-Backend-Engine', engine);
          res.end(JSON.stringify(data));
        };

        if (method === 'OPTIONS') {
          return sendJson({ ok: true });
        }

        // -------------------------------------------------------------
        // /api/download-hostinger-zip: Generate Hostinger Package
        // -------------------------------------------------------------
        if (pathname === '/api/download-hostinger-zip') {
          try {
            const ZipClass = (JSZip as any).default || JSZip;
            const zip = new ZipClass();
            const serverDir = import.meta.dirname || __dirname;
            const appDir = path.resolve(serverDir, '../..');
            const distDir = path.resolve(appDir, 'dist');
            const publicDir = path.resolve(appDir, 'public');

            // Add README
            const readmePath = path.resolve(publicDir, 'README-HOSTINGER.txt');
            if (fs.existsSync(readmePath)) {
              zip.file('README-HOSTINGER.txt', fs.readFileSync(readmePath, 'utf-8'));
            }

            // Add .htaccess
            const htaccessPath = path.resolve(publicDir, '.htaccess');
            if (fs.existsSync(htaccessPath)) {
              zip.file('.htaccess', fs.readFileSync(htaccessPath, 'utf-8'));
            }

            // Add API files
            const apiDir = path.resolve(publicDir, 'api');
            if (fs.existsSync(apiDir)) {
              const addDirToZip = (dir: string, zipFolder: JSZip) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                  const full = path.join(dir, file);
                  if (fs.statSync(full).isDirectory()) {
                    addDirToZip(full, zipFolder.folder(file)!);
                  } else {
                    zipFolder.file(file, fs.readFileSync(full));
                  }
                }
              };
              addDirToZip(apiDir, zip.folder('api')!);
            }

            // Add dist files if built
            if (fs.existsSync(distDir)) {
              const addDistToZip = (dir: string, zipFolder: JSZip) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                  if (file === 'api' || file === '.htaccess' || file === 'README-HOSTINGER.txt') continue;
                  const full = path.join(dir, file);
                  if (fs.statSync(full).isDirectory()) {
                    addDistToZip(full, zipFolder.folder(file)!);
                  } else {
                    zipFolder.file(file, fs.readFileSync(full));
                  }
                }
              };
              addDistToZip(distDir, zip);
            }

            const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="hostinger-public_html.zip"');
            res.end(content);
            return;
          } catch (err: any) {
            return sendJson({ error: 'Failed to generate zip: ' + err.message }, 500);
          }
        }

        // -------------------------------------------------------------
        // Try live PHP Backend first (PHP 8.2 CLI + PDO SQLite)
        // -------------------------------------------------------------
        try {
          ensurePhpServer();
          const phpTargetUrl = `http://127.0.0.1:8080${url}`;
          const hasPayload = (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') && Object.keys(body).length > 0;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const phpRes = await fetch(phpTargetUrl, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...((req.headers.authorization && { Authorization: req.headers.authorization }) || {}),
            },
            body: hasPayload ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (phpRes.ok || phpRes.status < 500) {
            if (method === 'HEAD') {
              res.statusCode = phpRes.status;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('X-Backend-Engine', 'PHP 8.2 PDO-SQLite');
              return res.end();
            }
            const phpJson = await phpRes.json();
            return sendJson(phpJson, phpRes.status, 'PHP 8.2 PDO-SQLite');
          }
        } catch (err: any) {
          console.error('[CRM API Proxy Error]:', err?.message || err);
          // Fall through to embedded engine if PHP is restarting or unavailable
        }

        // -------------------------------------------------------------
        // Resilient Embedded SQL Engine fallback
        // -------------------------------------------------------------
        const db = getSqliteDb();

        if (pathname === '/api/public/content' || pathname === '/api/content') {
          const projects = db.prepare('SELECT * FROM projects WHERE is_published = 1 ORDER BY id DESC').all();
          const blogs = db.prepare("SELECT * FROM blogs WHERE status = 'published' ORDER BY id DESC").all();
          const reviews = db.prepare('SELECT * FROM reviews WHERE is_published = 1 ORDER BY id DESC').all();

          return sendJson({ ok: true, projects, blogs, reviews });
        }

        if (pathname === '/api/crm/leads') {
          if (method === 'POST') {
            const id = 'ld_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
            const now = new Date().toISOString();
            const first = (body.firstName || body.first_name || 'New').trim();
            const last = (body.lastName || body.last_name || 'Lead').trim();
            const name = (body.name || `${first} ${last}`).trim();
            const email = (body.email || '').trim().toLowerCase();
            const phone = body.phone || '';
            const country = body.country || 'United Kingdom';
            const countryCode = body.countryCode || 'GB';
            const funnel = body.service || body.funnel || 'General';
            const company = body.company || '';
            const service = body.service || 'General Inquiry';
            const budget = body.budget || '';
            const timeline = body.timeline || '';
            const message = body.message || '';
            const source = body.source || 'website_contact_modal';
            const clientPassword = 'client' + Math.floor(100 + Math.random() * 900);

            const commentHistory = message
              ? JSON.stringify([{ id: 'c_' + Date.now(), by_name: 'Website Intake', text: message, created_at: now }])
              : JSON.stringify([]);
            const statusHistory = JSON.stringify([{ id: 's_' + Date.now(), from_stage: 'New', to_stage: 'New', by_name: 'System', created_at: now }]);
            const activityRecord = JSON.stringify({ pageViews: 1, sessions: 1, lastLogin: now });

            db.prepare(`
              INSERT INTO leads (
                id, first_name, last_name, name, email, phone, country, country_code,
                stage, status, funnel, company, service, budget, timeline, message,
                source, client_password, assigned_office_id, assigned_team_id, assigned_agent_id,
                comment_history, status_history, appointments, activity_record, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New', 'New', ?, ?, ?, ?, ?, ?, ?, ?, 'of_london', 'tm_alpha', 'adm_ag', ?, ?, '[]', ?, ?, ?)
            `).run(
              id, first, last, name, email, phone, country, countryCode,
              funnel, company, service, budget, timeline, message,
              source, clientPassword, commentHistory, statusHistory, activityRecord, now, now
            );

            db.prepare(`
              INSERT INTO portal_clients (id, name, company, email, password, phone, address, country, country_code, status, portal_enabled, tier, last_login_at, created_at)
              VALUES (?, ?, ?, ?, ?, ?, '', ?, ?, 'Active', 1, 'New Client', ?, ?)
            `).run(id, name, company || name, email, clientPassword, phone, country, countryCode, now, now);

            return sendJson({ ok: true, id, message: 'Inquiry received successfully' });
          }

          const rawLeads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
          const leads = rawLeads.map((r: any) => ({
            ...r,
            comment_history: r.comment_history ? JSON.parse(r.comment_history) : [],
            status_history: r.status_history ? JSON.parse(r.status_history) : [],
            appointments: r.appointments ? JSON.parse(r.appointments) : [],
            activity_record: r.activity_record ? JSON.parse(r.activity_record) : { pageViews: 1, sessions: 1, lastLogin: r.created_at },
          }));

          return sendJson({ ok: true, leads });
        }

        if (pathname === '/api/crm/action') {
          const action = body.action || '';

          if (action === 'toggle_project') {
            const id = Number(body.id);
            const isPub = body.is_published ? 1 : 0;
            db.prepare('UPDATE projects SET is_published = ? WHERE id = ?').run(isPub, id);
            return sendJson({ ok: true, id, is_published: Boolean(isPub) });
          }

          if (action === 'save_project') {
            const title = body.title || 'New Project';
            const siteName = body.site_name || '';
            const siteUrl = body.site_url || '';
            const desc = body.description || '';
            const cat = body.category || 'Websites & Web Apps';
            const img = body.image_url || '/hero/web-apps.jpg';
            const isPub = body.is_published !== false ? 1 : 0;
            const now = new Date().toISOString();

            const res = db.prepare(`
              INSERT INTO projects (title, site_name, site_url, description, category, image_url, is_published, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(title, siteName, siteUrl, desc, cat, img, isPub, now);

            return sendJson({ ok: true, id: Number(res.lastInsertRowid) });
          }

          if (action === 'delete_project') {
            const id = Number(body.id);
            db.prepare('DELETE FROM projects WHERE id = ?').run(id);
            return sendJson({ ok: true });
          }

          if (action === 'save_blog' || action === 'update_blog') {
            const now = new Date().toISOString();
            const title = body.title || 'Untitled Article';
            const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const content = body.content || '';
            const excerpt = body.excerpt || '';
            const category = body.category || 'Engineering';
            const author = body.author || 'Codex Architecture Team';
            const status = body.status || 'published';
            const img = body.featured_image || '/hero/web-dev.jpg';
            const meta = body.meta_description || excerpt;
            const readingTime = Math.max(1, Math.round((content || '').split(/\s+/).length / 200));

            if (body.id) {
              db.prepare(`
                UPDATE blogs
                SET title = ?, slug = ?, content = ?, excerpt = ?, category = ?, author = ?, status = ?, featured_image = ?, meta_description = ?, reading_time = ?, updated_at = ?
                WHERE id = ?
              `).run(title, slug, content, excerpt, category, author, status, img, meta, readingTime, now, Number(body.id));

              return sendJson({ ok: true, id: Number(body.id) });
            }

            const res = db.prepare(`
              INSERT INTO blogs (title, slug, content, excerpt, category, author, status, featured_image, meta_description, reading_time, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(title, slug, content, excerpt, category, author, status, img, meta, readingTime, now, now);

            return sendJson({ ok: true, id: Number(res.lastInsertRowid) });
          }

          if (action === 'delete_blog') {
            const id = Number(body.id);
            db.prepare('DELETE FROM blogs WHERE id = ?').run(id);
            return sendJson({ ok: true });
          }

          return sendJson({ ok: true });
        }

        if (pathname === '/api/admin/users') {
          const search = (parsedUrl.searchParams.get('search') || '').trim();
          const limit = Math.min(200, Math.max(1, Number(parsedUrl.searchParams.get('limit')) || 100));

          let clients;
          if (search) {
            const term = `%${search}%`;
            clients = db.prepare(`
              SELECT id, name, company, email, phone, country, country_code, status, password as clientPassword, tier, last_login_at, created_at
              FROM portal_clients
              WHERE name LIKE ? OR email LIKE ? OR company LIKE ? OR id LIKE ?
              ORDER BY name ASC
              LIMIT ?
            `).all(term, term, term, term, limit);
          } else {
            clients = db.prepare(`
              SELECT id, name, company, email, phone, country, country_code, status, password as clientPassword, tier, last_login_at, created_at
              FROM portal_clients
              ORDER BY name ASC
              LIMIT ?
            `).all(limit);
          }

          return sendJson({ ok: true, users: clients, total: clients.length });
        }

        // Messages fallback
        if (pathname === '/api/admin/messages' || pathname === '/api/client/messages') {
          if (method === 'POST') {
            const userId = (body.user_id || body.userId || '').trim();
            const text = (body.body || body.text || '').trim();
            const sender = body.sender === 'client' ? 'client' : 'agent';
            const senderName = body.sender_name || (sender === 'client' ? 'Client' : 'Support Agent');
            const now = new Date().toISOString();
            const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

            db.prepare(`
              INSERT INTO messages (id, user_id, sender, sender_name, body, is_read, created_at)
              VALUES (?, ?, ?, ?, ?, 0, ?)
            `).run(msgId, userId, sender, senderName, text, now);

            return sendJson({
              ok: true,
              message: { id: msgId, user_id: userId, sender, sender_name: senderName, body: text, created_at: now },
            });
          }

          const userId = parsedUrl.searchParams.get('user_id') || '';
          const msgs = userId
            ? db.prepare('SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC').all(userId)
            : db.prepare('SELECT * FROM messages ORDER BY created_at ASC').all();

          return sendJson({ ok: true, user: { id: userId }, messages: msgs, unread_count: 0 });
        }

        // Notifications fallback
        if (pathname === '/api/admin/notifications/send' && method === 'POST') {
          const userId = body.user_id || body.userId || null;
          const message = (body.message || '').trim();
          const kind = body.kind || 'info';
          const title = (body.title || 'Administrator Notice').trim();
          const now = new Date().toISOString();
          const notifId = 'notif_' + Date.now();

          db.prepare(`
            INSERT INTO notifications (id, user_id, title, description, kind, type, is_read, link, sent_by, created_at)
            VALUES (?, ?, ?, ?, ?, 'project', 0, '/portal/notifications', 'Admin', ?)
          `).run(notifId, userId, title, message, kind, now);

          return sendJson({ ok: true, id: notifId, sent: 1 });
        }

        if (pathname === '/api/admin/notifications/sent-log' || pathname === '/api/client/notifications') {
          const targetUserId = parsedUrl.searchParams.get('user_id');
          const notifs = targetUserId
            ? db.prepare("SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 100").all(targetUserId)
            : db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100').all();
          return sendJson({ ok: true, notifications: notifs, log: notifs, total: notifs.length });
        }

        // Audit log fallback
        if (pathname === '/api/admin/audit') {
          const userId = parsedUrl.searchParams.get('user_id');
          const logs = userId
            ? db.prepare('SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(userId)
            : db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all();
          return sendJson({ ok: true, log: logs, history: logs, total: logs.length });
        }

        sendJson({ ok: true, timestamp: new Date().toISOString() });
      });
    },
  };
}
