import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  country_code: string;
  stage: string;
  status: string;
  funnel: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  source: string;
  notes?: string;
  client_password?: string;
  clientPassword?: string;
  assigned_office_id?: string;
  assigned_team_id?: string;
  assigned_agent_id?: string;
  is_online?: boolean;
  comment_history?: any[];
  status_history?: any[];
  appointments?: any[];
  activity_record?: {
    pageViews: number;
    sessions: number;
    lastLogin: string;
  };
  created_at: string;
  updated_at: string;
}

interface PortalClient {
  id: string;
  name: string;
  company: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  country: string;
  countryCode: string;
  status: string;
  portalEnabled: boolean;
  tier: string;
  lastLoginAt: string;
  createdAt: string;
}

interface NotificationItem {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  kind: string;
  type: string;
  is_read: boolean;
  link: string;
  sent_by: string;
  created_at: string;
}

interface MessageItem {
  id: string;
  user_id: string;
  sender: 'agent' | 'client';
  sender_name?: string;
  body: string;
  created_at: string;
  is_read?: boolean;
}

interface AuditLogItem {
  id: string;
  user_id: string;
  client_name?: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

interface ProjectItem {
  id: number;
  title: string;
  site_name: string;
  site_url: string;
  description: string;
  category: string;
  image_url: string;
  is_published: boolean;
  created_at: string;
}

interface BlogItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  status: string;
  featured_image: string;
  meta_description: string;
  reading_time: number;
  created_at: string;
  updated_at: string;
}

const DATA_FILE = path.resolve(process.cwd(), 'artifacts/codex-dynamics/data-store.json');

function getInitialStore() {
  const now = new Date().toISOString();
  return {
    clients: [
      {
        id: 'client_vance',
        name: 'Eleanor Vance',
        company: 'Vance Tech Capital',
        email: 'eleanor.vance@vancetech.io',
        password: 'client123',
        phone: '+1 (415) 890-2341',
        address: '450 Mission St, Suite 1800, San Francisco, CA 94105',
        country: 'United States',
        countryCode: 'US',
        status: 'Active',
        portalEnabled: true,
        tier: 'Enterprise Partner',
        lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
      {
        id: 'client_brody',
        name: 'Marcus Brody',
        company: 'Brody Luxury Goods',
        email: 'marcus@brodydesign.co',
        password: 'client123',
        phone: '+44 20 7946 0912',
        address: '14 Berkeley Square, Mayfair, London W1J 6BL',
        country: 'United Kingdom',
        countryCode: 'GB',
        status: 'Active',
        portalEnabled: true,
        tier: 'Growth Tier',
        lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      },
      {
        id: 'usr_client',
        name: 'Alex Morgan',
        company: 'Morgan Digital Media',
        email: 'client@codexdynamics.com',
        password: 'client123',
        phone: '+1 (555) 234-5678',
        address: '777 Broadway, 12th Floor, New York, NY 10003',
        country: 'United States',
        countryCode: 'US',
        status: 'Active',
        portalEnabled: true,
        tier: 'Dedicated Agency',
        lastLoginAt: new Date(Date.now() - 1800000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      },
    ] as PortalClient[],

    leads: [
      {
        id: 'client_vance',
        first_name: 'Eleanor',
        last_name: 'Vance',
        name: 'Eleanor Vance',
        email: 'eleanor.vance@vancetech.io',
        phone: '+1 (415) 890-2341',
        country: 'United States',
        country_code: 'US',
        stage: 'New',
        status: 'New',
        funnel: 'High-Performance Website',
        company: 'Vance Tech Capital',
        service: 'High-Performance Website',
        budget: '$15,000 - $25,000',
        timeline: 'Within 1 Month',
        message: 'We need a complete rebuild of our venture fund corporate portal with real-time portfolio performance dashboards and interactive investor LP access.',
        source: 'website_contact_modal',
        notes: 'High priority lead.',
        client_password: 'client123',
        clientPassword: 'client123',
        assigned_office_id: 'of_london',
        assigned_team_id: 'tm_alpha',
        assigned_agent_id: 'adm_ag',
        is_online: true,
        comment_history: [
          { id: 'c1', by_name: 'Website Intake', text: 'Intake submitted via corporate booking modal.', created_at: now },
        ],
        status_history: [
          { id: 's1', from_stage: 'New', to_stage: 'New', by_name: 'System', created_at: now },
        ],
        appointments: [],
        activity_record: {
          pageViews: 28,
          sessions: 7,
          lastLogin: new Date(Date.now() - 3600000).toISOString(),
        },
        created_at: now,
        updated_at: now,
      },
      {
        id: 'client_brody',
        first_name: 'Marcus',
        last_name: 'Brody',
        name: 'Marcus Brody',
        email: 'marcus@brodydesign.co',
        phone: '+44 20 7946 0912',
        country: 'United Kingdom',
        country_code: 'GB',
        stage: 'In Line',
        status: 'In Line',
        funnel: 'Web Design & UI/UX',
        company: 'Brody Luxury Goods',
        service: 'Web Design & UI/UX',
        budget: '$10,000 - $18,000',
        timeline: 'Immediate',
        message: 'Looking for a bespoke e-commerce experience with 3D product previews and ultra-fast mobile checkout.',
        source: 'website_contact_form',
        notes: 'Waiting for brand pack.',
        client_password: 'client123',
        clientPassword: 'client123',
        assigned_office_id: 'of_london',
        assigned_team_id: 'tm_alpha',
        assigned_agent_id: 'adm_ag',
        is_online: false,
        comment_history: [],
        status_history: [],
        appointments: [],
        activity_record: {
          pageViews: 14,
          sessions: 4,
          lastLogin: new Date(Date.now() - 7200000).toISOString(),
        },
        created_at: now,
        updated_at: now,
      },
      {
        id: 'ld_1001',
        first_name: 'James',
        last_name: 'Morrison',
        name: 'James Morrison',
        email: 'james.morrison@enterprise.co.uk',
        phone: '+44 20 7946 0912',
        country: 'United Kingdom',
        country_code: 'GB',
        stage: 'In Line',
        status: 'In Line',
        funnel: 'Web Development',
        company: 'Enterprise UK',
        service: 'Web Development',
        budget: '$20,000+',
        timeline: '1-2 Months',
        message: 'Requirements discovery for global corporate web platform.',
        source: 'direct',
        client_password: 'client123',
        clientPassword: 'client123',
        assigned_office_id: 'of_london',
        assigned_team_id: 'tm_alpha',
        assigned_agent_id: 'adm_ag',
        comment_history: [],
        status_history: [],
        appointments: [],
        activity_record: {
          pageViews: 19,
          sessions: 5,
          lastLogin: new Date(Date.now() - 14400000).toISOString(),
        },
        created_at: now,
        updated_at: now,
      },
    ] as Lead[],

    notifications: [
      {
        id: 'notif_init_1',
        user_id: 'client_vance',
        title: 'Project Milestone Reached',
        description: 'Frontend architectural review completed successfully for Vance Capital.',
        kind: 'project',
        type: 'project',
        is_read: false,
        link: '/portal/projects',
        sent_by: 'Sarah Admin',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'notif_init_2',
        user_id: null,
        title: 'Platform Security Update',
        description: 'Scheduled infrastructure maintenance completed with zero downtime.',
        kind: 'system',
        type: 'domain',
        is_read: true,
        link: '/portal/notifications',
        sent_by: 'System',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ] as NotificationItem[],

    messages: [
      {
        id: 'msg_init_1',
        user_id: 'client_vance',
        sender: 'client',
        sender_name: 'Eleanor Vance',
        body: 'Hello team, could you please provide an update on the dashboard integration timeline?',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        is_read: true,
      },
      {
        id: 'msg_init_2',
        user_id: 'client_vance',
        sender: 'agent',
        sender_name: 'Alex Agent',
        body: 'Hi Eleanor! The dashboard APIs are wired and our team is running final end-to-end load tests today.',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        is_read: true,
      },
    ] as MessageItem[],

    auditLogs: [
      {
        id: 'aud_1',
        user_id: 'client_vance',
        client_name: 'Eleanor Vance',
        action: 'CLIENT_LOGIN',
        details: 'Logged into Client Portal dashboard from Chrome on macOS',
        ip_address: '192.168.1.104',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'aud_2',
        user_id: 'client_vance',
        client_name: 'Eleanor Vance',
        action: 'PAGE_VIEW',
        details: 'Viewed Portfolio Projects and Milestone Deliverables',
        ip_address: '192.168.1.104',
        created_at: new Date(Date.now() - 3500000).toISOString(),
      },
      {
        id: 'aud_3',
        user_id: 'client_vance',
        client_name: 'Eleanor Vance',
        action: 'TICKET_REPLIED',
        details: 'Sent support message: "Hello team, could you please provide an update..."',
        ip_address: '192.168.1.104',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'aud_4',
        user_id: 'client_brody',
        client_name: 'Marcus Brody',
        action: 'CLIENT_LOGIN',
        details: 'Client session established from Safari on iOS',
        ip_address: '82.45.12.89',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ] as AuditLogItem[],

    projects: [
      {
        id: 1,
        title: 'Vance Tech Capital Portal',
        site_name: 'Vance Capital',
        site_url: 'https://vancetech.io',
        description: 'Next-generation venture capital portfolio management and investor dashboard.',
        category: 'Websites & Web Apps',
        image_url: '/hero/web-apps.jpg',
        is_published: true,
        created_at: now,
      },
      {
        id: 2,
        title: 'Brody Luxury Storefront',
        site_name: 'Brody Goods',
        site_url: 'https://brodydesign.co',
        description: 'Bespoke high-conversion storefront with 3D product previews and instant checkout.',
        category: 'Websites & Web Apps',
        image_url: '/hero/design.jpg',
        is_published: true,
        created_at: now,
      },
      {
        id: 3,
        title: 'Apex Telephony & CRM Gateway',
        site_name: 'Apex VoIP',
        site_url: 'https://apextelecom.net',
        description: 'Omnichannel calling system, VoIP routing, and automated sales pipeline engine.',
        category: 'CRMs & Calling Systems',
        image_url: '/services/crm-calling.jpg',
        is_published: true,
        created_at: now,
      },
      {
        id: 4,
        title: 'Kroma Digital Studio',
        site_name: 'Kroma Brand',
        site_url: 'https://kromastudio.art',
        description: 'Identity guidelines, custom 3D design system, and multi-channel brand assets.',
        category: 'Graphic Design & Branding',
        image_url: '/services/graphic-design.jpg',
        is_published: true,
        created_at: now,
      },
    ] as ProjectItem[],

    blogs: [
      {
        id: 1,
        title: 'Engineering High-Throughput Web Applications on Edge Networks',
        slug: 'engineering-high-throughput-web-apps-edge',
        content: '<p>Modern enterprise platforms require sub-100ms global latency and zero-downtime rollouts. In this guide, we dive into how Codex Dynamics engineers edge architectures...</p>',
        excerpt: 'How modern edge networks, reactive client state, and distributed caching unlock instantaneous web experiences.',
        category: 'Engineering',
        author: 'Codex Architecture Team',
        status: 'published',
        featured_image: '/hero/web-dev.jpg',
        meta_description: 'Architecture blueprints for enterprise high-throughput web applications.',
        reading_time: 4,
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        title: 'The Blueprint for High-Converting Digital Storefronts',
        slug: 'blueprint-high-converting-storefronts',
        content: '<p>Conversion rate optimization starts with layout clarity, tactile typography, and frictionless checkout flows...</p>',
        excerpt: 'Strategic design patterns and technical optimizations that drive 3x conversion improvements for commerce brands.',
        category: 'Design & UX',
        author: 'Codex Creative Studio',
        status: 'published',
        featured_image: '/hero/design.jpg',
        meta_description: 'Design patterns and optimizations for high-converting ecommerce storefronts.',
        reading_time: 5,
        created_at: now,
        updated_at: now,
      },
    ] as BlogItem[],

    reviews: [
      {
        id: 1,
        author: 'Eleanor Vance (Vance Tech Capital)',
        rating: 5,
        comment: 'Codex Dynamics completely transformed our corporate presence. The client portal and real-time reporting have been a game changer for our LP relationships.',
        is_published: true,
        created_at: now,
      },
      {
        id: 2,
        author: 'Marcus Brody (Brody Luxury Goods)',
        rating: 5,
        comment: 'Incredible execution speed and attention to detail. Our mobile conversion went up 42% in the first two weeks post-launch.',
        is_published: true,
        created_at: now,
      },
    ],
  };
}

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[crmApiPlugin] Failed to read store, falling back to initial', err);
  }
  const initial = getInitialStore();
  saveStore(initial);
  return initial;
}

function saveStore(store: any) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[crmApiPlugin] Failed to save store', err);
  }
}

export function crmApiPlugin(): Plugin {
  return {
    name: 'codex-crm-api-plugin',
    configureServer(server) {
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

        const sendJson = (data: any, status = 200) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.end(JSON.stringify(data));
        };

        if (method === 'OPTIONS') {
          return sendJson({ ok: true });
        }

        const store = loadStore();

        // -------------------------------------------------------------
        // /api/download-hostinger-zip: Generate Hostinger Package
        // -------------------------------------------------------------
        if (pathname === '/api/download-hostinger-zip') {
          try {
            const zip = new JSZip();
            const rootDir = process.cwd();
            const distDir = path.resolve(rootDir, 'artifacts/codex-dynamics/dist');
            const publicDir = path.resolve(rootDir, 'artifacts/codex-dynamics/public');

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

            // Add dist files if built, otherwise placeholder
            if (fs.existsSync(distDir)) {
              const addDistToZip = (dir: string, zipFolder: JSZip) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                  const full = path.join(dir, file);
                  if (file === 'api' || file === '.htaccess' || file === 'README-HOSTINGER.txt') continue;
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
        // /api/public/content: Public portfolio, reviews, blogs
        // -------------------------------------------------------------
        if (pathname === '/api/public/content' || pathname === '/api/content') {
          return sendJson({
            ok: true,
            projects: (store.projects || []).filter((p: ProjectItem) => p.is_published !== false),
            blogs: (store.blogs || []).filter((b: BlogItem) => b.status === 'published'),
            reviews: (store.reviews || []).filter((r: any) => r.is_published !== false),
          });
        }

        // -------------------------------------------------------------
        // /api/crm/leads: Contact intake
        // -------------------------------------------------------------
        if (pathname === '/api/crm/leads') {
          if (method === 'POST') {
            const id = 'ld_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
            const now = new Date().toISOString();
            const first = (body.firstName || body.first_name || 'New').trim();
            const last = (body.lastName || body.last_name || 'Lead').trim();
            const name = (body.name || `${first} ${last}`).trim();
            const email = (body.email || '').trim().toLowerCase();

            const newLead: Lead = {
              id,
              first_name: first,
              last_name: last,
              name,
              email,
              phone: body.phone || '',
              country: body.country || 'United Kingdom',
              country_code: body.countryCode || 'GB',
              stage: 'New',
              status: 'New',
              funnel: body.service || body.funnel || 'General',
              company: body.company || '',
              service: body.service || 'General Inquiry',
              budget: body.budget || '',
              timeline: body.timeline || '',
              message: body.message || '',
              source: body.source || 'website_contact_modal',
              client_password: 'client' + Math.floor(100 + Math.random() * 900),
              clientPassword: 'client' + Math.floor(100 + Math.random() * 900),
              assigned_office_id: 'of_london',
              assigned_team_id: 'tm_alpha',
              assigned_agent_id: 'adm_ag',
              is_online: false,
              comment_history: body.message ? [{ id: 'c_' + Date.now(), by_name: 'Website Intake', text: body.message, created_at: now }] : [],
              status_history: [{ id: 's_' + Date.now(), from_stage: 'New', to_stage: 'New', by_name: 'System', created_at: now }],
              appointments: [],
              activity_record: { pageViews: 1, sessions: 1, lastLogin: now },
              created_at: now,
              updated_at: now,
            };

            store.leads.unshift(newLead);

            // Also create a client record so they can log into the portal
            store.clients.unshift({
              id,
              name,
              company: body.company || name,
              email,
              password: newLead.client_password,
              phone: body.phone || '',
              address: '',
              country: newLead.country,
              countryCode: newLead.country_code,
              status: 'Active',
              portalEnabled: true,
              tier: 'New Client',
              lastLoginAt: now,
              createdAt: now,
            });

            // Log activity
            store.auditLogs.unshift({
              id: 'aud_' + Date.now(),
              user_id: id,
              client_name: name,
              action: 'CLIENT_INQUIRY',
              details: `Submitted inquiry: ${newLead.service}`,
              ip_address: '127.0.0.1',
              created_at: now,
            });

            saveStore(store);
            return sendJson({ ok: true, id, message: 'Inquiry received successfully' });
          }

          return sendJson({ ok: true, leads: store.leads });
        }

        // -------------------------------------------------------------
        // /api/crm/action: Project toggle/hide, Blog editor, etc.
        // -------------------------------------------------------------
        if (pathname === '/api/crm/action') {
          const action = body.action || '';

          // Toggle project visibility (Hide/Show on site)
          if (action === 'toggle_project') {
            const id = Number(body.id);
            const isPub = Boolean(body.is_published);
            const proj = store.projects.find((p: ProjectItem) => p.id === id);
            if (proj) {
              proj.is_published = isPub;
              saveStore(store);
              return sendJson({ ok: true, id, is_published: isPub });
            }
            return sendJson({ ok: false, error: 'Project not found' }, 404);
          }

          // Save project
          if (action === 'save_project') {
            const id = Date.now();
            const newProj: ProjectItem = {
              id,
              title: body.title || 'New Project',
              site_name: body.site_name || '',
              site_url: body.site_url || '',
              description: body.description || '',
              category: body.category || 'Websites & Web Apps',
              image_url: body.image_url || '/hero/web-apps.jpg',
              is_published: body.is_published !== false,
              created_at: new Date().toISOString(),
            };
            store.projects.unshift(newProj);
            saveStore(store);
            return sendJson({ ok: true, id });
          }

          // Delete project
          if (action === 'delete_project') {
            const id = Number(body.id);
            store.projects = store.projects.filter((p: ProjectItem) => p.id !== id);
            saveStore(store);
            return sendJson({ ok: true });
          }

          // Save or update blog
          if (action === 'save_blog' || action === 'update_blog') {
            const now = new Date().toISOString();
            if (body.id) {
              const existing = store.blogs.find((b: BlogItem) => b.id === Number(body.id));
              if (existing) {
                Object.assign(existing, body, { updated_at: now });
                saveStore(store);
                return sendJson({ ok: true, id: existing.id });
              }
            }
            const id = Date.now();
            const newBlog: BlogItem = {
              id,
              title: body.title || 'Untitled Article',
              slug: body.slug || (body.title || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              content: body.content || '',
              excerpt: body.excerpt || '',
              category: body.category || 'Engineering',
              author: 'Codex Architecture Team',
              status: body.status || 'published',
              featured_image: body.featured_image || '/hero/web-dev.jpg',
              meta_description: body.meta_description || body.excerpt || '',
              reading_time: Math.max(1, Math.round((body.content || '').split(/\s+/).length / 200)),
              created_at: now,
              updated_at: now,
            };
            store.blogs.unshift(newBlog);
            saveStore(store);
            return sendJson({ ok: true, id });
          }

          // Delete blog
          if (action === 'delete_blog') {
            const id = Number(body.id);
            store.blogs = store.blogs.filter((b: BlogItem) => b.id !== id);
            saveStore(store);
            return sendJson({ ok: true });
          }

          // Upload image
          if (action === 'upload_image') {
            const filename = `upload_${Date.now()}_${(body.name || 'image.png').replace(/[^a-zA-Z0-9_\.-]/g, '_')}`;
            const uploadsDir = path.resolve(process.cwd(), 'artifacts/codex-dynamics/public/uploads');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            if (body.data && body.data.includes(',')) {
              const base64 = body.data.split(',')[1];
              fs.writeFileSync(path.join(uploadsDir, filename), Buffer.from(base64, 'base64'));
              return sendJson({ ok: true, url: `/uploads/${filename}` });
            }
            return sendJson({ ok: true, url: '/hero/studio.jpg' });
          }

          return sendJson({ ok: true });
        }

        // -------------------------------------------------------------
        // /api/admin/users: Client search with instant filtering & suggestions
        // -------------------------------------------------------------
        if (pathname === '/api/admin/users') {
          const search = (parsedUrl.searchParams.get('search') || '').trim().toLowerCase();
          const limit = Number(parsedUrl.searchParams.get('limit')) || 200;

          // Merge clients from store and leads
          const clientMap = new Map<string, any>();
          for (const c of store.clients || []) {
            clientMap.set(c.id, {
              id: c.id,
              name: c.name,
              company: c.company,
              email: c.email,
              phone: c.phone,
              country: c.country,
              country_code: c.countryCode,
              status: c.status,
              password: c.password,
              clientPassword: c.password,
              tier: c.tier,
              last_login_at: c.lastLoginAt,
              created_at: c.createdAt,
            });
          }
          for (const l of store.leads || []) {
            if (!clientMap.has(l.id)) {
              clientMap.set(l.id, {
                id: l.id,
                name: l.name,
                company: l.company || l.name,
                email: l.email,
                phone: l.phone,
                country: l.country,
                country_code: l.country_code,
                status: 'Active',
                password: l.client_password || l.clientPassword,
                clientPassword: l.client_password || l.clientPassword,
                tier: 'Client',
                last_login_at: l.created_at,
                created_at: l.created_at,
              });
            }
          }

          let results = Array.from(clientMap.values());
          if (search) {
            results = results.filter((c) =>
              (c.name && c.name.toLowerCase().includes(search)) ||
              (c.email && c.email.toLowerCase().includes(search)) ||
              (c.company && c.company.toLowerCase().includes(search)) ||
              (c.id && c.id.toLowerCase().includes(search)) ||
              (c.phone && c.phone.includes(search))
            );
          }

          return sendJson({
            ok: true,
            users: results.slice(0, limit),
            total: results.length,
          });
        }

        // -------------------------------------------------------------
        // /api/admin/users/:id/set-password & /api/admin/leads/:id/set-password
        // -------------------------------------------------------------
        const setPasswordMatch = pathname.match(/^\/api\/admin\/(users|leads)\/([^\/]+)\/set-password$/);
        if (setPasswordMatch && method === 'POST') {
          const userId = decodeURIComponent(setPasswordMatch[2]);
          const newPassword = (body.password || body.client_password || '').trim();
          if (!newPassword) {
            return sendJson({ ok: false, error: 'Password cannot be empty' }, 400);
          }

          // Update in clients
          const client = store.clients.find((c: PortalClient) => c.id === userId || c.email === userId);
          if (client) client.password = newPassword;

          // Update in leads
          const lead = store.leads.find((l: Lead) => l.id === userId || l.email === userId);
          if (lead) {
            lead.client_password = newPassword;
            lead.clientPassword = newPassword;
          }

          // Add audit log
          store.auditLogs.unshift({
            id: 'aud_' + Date.now(),
            user_id: userId,
            client_name: client?.name || lead?.name || 'Client',
            action: 'PASSWORD_RESET',
            details: 'Administrator updated client portal account password',
            ip_address: '127.0.0.1',
            created_at: new Date().toISOString(),
          });

          saveStore(store);
          return sendJson({
            ok: true,
            message: 'Password updated successfully',
            password: newPassword,
          });
        }

        // -------------------------------------------------------------
        // /api/admin/notifications/send: Send notification to client or all
        // -------------------------------------------------------------
        if (pathname === '/api/admin/notifications/send' && method === 'POST') {
          const userId = body.user_id || body.userId || null;
          const message = (body.message || '').trim();
          const kind = body.kind || 'info';
          const title = (body.title || 'Administrator Notice').trim();
          const now = new Date().toISOString();

          if (!message) {
            return sendJson({ ok: false, error: 'Message cannot be empty' }, 400);
          }

          const notifId = 'notif_' + Date.now();
          const notif: NotificationItem = {
            id: notifId,
            user_id: userId,
            title,
            description: message,
            kind,
            type: kind === 'billing' ? 'invoice' : kind === 'project' ? 'project' : 'support',
            is_read: false,
            link: '/portal/notifications',
            sent_by: 'Admin',
            created_at: now,
          };

          store.notifications.unshift(notif);
          saveStore(store);

          return sendJson({
            ok: true,
            id: notifId,
            sent: userId ? 1 : (store.clients.length || 1),
          });
        }

        // -------------------------------------------------------------
        // /api/admin/notifications/sent-log
        // -------------------------------------------------------------
        if (pathname === '/api/admin/notifications/sent-log') {
          if (method === 'DELETE') {
            store.notifications = [];
            saveStore(store);
            return sendJson({ ok: true });
          }
          return sendJson({
            ok: true,
            log: store.notifications || [],
            total: store.notifications.length,
          });
        }

        // -------------------------------------------------------------
        // /api/admin/messages: Support chat between Admin & Client
        // -------------------------------------------------------------
        if (pathname === '/api/admin/messages') {
          if (method === 'POST') {
            const userId = (body.user_id || body.userId || '').trim();
            const text = (body.body || body.text || '').trim();
            if (!userId || !text) {
              return sendJson({ ok: false, error: 'user_id and message body required' }, 400);
            }

            const now = new Date().toISOString();
            const newMsg: MessageItem = {
              id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
              user_id: userId,
              sender: 'agent',
              sender_name: 'Support Agent',
              body: text,
              is_read: false,
              created_at: now,
            };

            store.messages.push(newMsg);

            // Add activity log
            store.auditLogs.unshift({
              id: 'aud_' + Date.now(),
              user_id: userId,
              action: 'SUPPORT_MESSAGE_SENT',
              details: `Agent sent message: "${text.slice(0, 60)}"`,
              ip_address: '127.0.0.1',
              created_at: now,
            });

            saveStore(store);
            return sendJson({ ok: true, message: newMsg });
          }

          const userId = parsedUrl.searchParams.get('user_id') || '';
          const userMsgs = (store.messages || []).filter((m: MessageItem) => !userId || m.user_id === userId);
          return sendJson({
            ok: true,
            user: { id: userId },
            messages: userMsgs,
            unread_count: userMsgs.filter((m: MessageItem) => m.sender === 'client' && !m.is_read).length,
            has_more: false,
          });
        }

        if (pathname === '/api/admin/messages/read' && method === 'POST') {
          const userId = body.user_id || '';
          if (userId) {
            for (const m of store.messages) {
              if (m.user_id === userId && m.sender === 'client') m.is_read = true;
            }
            saveStore(store);
          }
          return sendJson({ ok: true });
        }

        if (pathname === '/api/admin/messages/clear' && method === 'POST') {
          const userId = body.user_id || '';
          if (userId) {
            store.messages = store.messages.filter((m: MessageItem) => m.user_id !== userId);
            saveStore(store);
          }
          return sendJson({ ok: true });
        }

        // -------------------------------------------------------------
        // /api/admin/audit & /api/admin/users/:id/profile-history: Activity
        // -------------------------------------------------------------
        const profileHistoryMatch = pathname.match(/^\/api\/admin\/users\/([^\/]+)\/profile-history$/);
        if (pathname === '/api/admin/audit' || profileHistoryMatch) {
          const userId = profileHistoryMatch ? decodeURIComponent(profileHistoryMatch[1]) : parsedUrl.searchParams.get('user_id');
          let logs = store.auditLogs || [];
          if (userId) {
            logs = logs.filter((l: AuditLogItem) => l.user_id === userId);
          }
          return sendJson({
            ok: true,
            log: logs,
            history: logs,
            total: logs.length,
          });
        }

        // -------------------------------------------------------------
        // /api/admin/leads: Leads list & single lead operations
        // -------------------------------------------------------------
        const leadMatch = pathname.match(/^\/api\/admin\/leads(?:\/([^\/]+))?$/);
        if (leadMatch) {
          const leadId = leadMatch[1] ? decodeURIComponent(leadMatch[1]) : null;

          if (leadId) {
            const lead = store.leads.find((l: Lead) => l.id === leadId);
            if (!lead) return sendJson({ ok: false, error: 'Lead not found' }, 404);

            if (method === 'PATCH') {
              Object.assign(lead, body, { updated_at: new Date().toISOString() });
              if (body.client_password || body.clientPassword) {
                const pwd = body.client_password || body.clientPassword;
                lead.client_password = pwd;
                lead.clientPassword = pwd;
                const cl = store.clients.find((c: PortalClient) => c.id === leadId || c.email === lead.email);
                if (cl) cl.password = pwd;
              }
              saveStore(store);
              return sendJson({ ok: true, lead });
            }

            if (method === 'DELETE') {
              store.leads = store.leads.filter((l: Lead) => l.id !== leadId);
              saveStore(store);
              return sendJson({ ok: true });
            }

            return sendJson({ ok: true, lead });
          }

          return sendJson({ ok: true, leads: store.leads, total: store.leads.length });
        }

        // Default response for unmatched /api/ route
        sendJson({ ok: true, timestamp: new Date().toISOString() });
      });
    },
  };
}
