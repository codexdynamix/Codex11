import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite');

export interface SqliteDbInstance {
  exec: (sql: string) => void;
  prepare: (sql: string) => {
    all: (...params: any[]) => any[];
    get: (...params: any[]) => any;
    run: (...params: any[]) => { lastInsertRowid: number | bigint; changes: number };
  };
}

let dbInstance: SqliteDbInstance | null = null;

export function getSqliteDb(): SqliteDbInstance {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure data directory exists
  const dataDir = path.resolve(process.cwd(), 'artifacts/codex-dynamics/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbFilePath = path.join(dataDir, 'codex.sqlite');
  const db = new DatabaseSync(dbFilePath);

  // Enable WAL journal mode & foreign keys for optimal SQLite concurrency
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Initialize all SQL Schemas (matches public/api/db.php)
  initSqlSchema(db);

  dbInstance = db;
  return db;
}

function initSqlSchema(db: SqliteDbInstance) {
  // 1. Leads Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      name TEXT,
      email TEXT,
      phone TEXT,
      country TEXT DEFAULT 'United Kingdom',
      country_code TEXT DEFAULT 'GB',
      stage TEXT DEFAULT 'New',
      status TEXT DEFAULT 'New',
      funnel TEXT DEFAULT 'General',
      company TEXT,
      service TEXT,
      budget TEXT,
      timeline TEXT,
      message TEXT,
      source TEXT DEFAULT 'direct',
      notes TEXT,
      client_password TEXT,
      assigned_office_id TEXT,
      assigned_team_id TEXT,
      assigned_agent_id TEXT,
      assigned_by TEXT,
      is_online INTEGER DEFAULT 0,
      comment_history TEXT,
      status_history TEXT,
      appointments TEXT,
      activity_record TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // 2. Clients / Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS portal_clients (
      id TEXT PRIMARY KEY,
      name TEXT,
      company TEXT,
      email TEXT UNIQUE,
      password TEXT,
      phone TEXT,
      address TEXT,
      country TEXT DEFAULT 'United Kingdom',
      country_code TEXT DEFAULT 'GB',
      status TEXT DEFAULT 'Active',
      portal_enabled INTEGER DEFAULT 1,
      tier TEXT DEFAULT 'Enterprise Partner',
      last_login_at TEXT,
      created_at TEXT
    );
  `);

  // 3. Notifications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      description TEXT,
      kind TEXT DEFAULT 'info',
      type TEXT DEFAULT 'project',
      is_read INTEGER DEFAULT 0,
      link TEXT,
      sent_by TEXT DEFAULT 'Admin',
      created_at TEXT
    );
  `);

  // 4. Messages Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      sender_name TEXT,
      body TEXT NOT NULL,
      attachment_name TEXT,
      attachment_path TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT
    );
  `);

  // 5. Audit Log (Activity) Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      client_name TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT
    );
  `);

  // 6. Portfolio Projects Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      site_name TEXT,
      site_url TEXT,
      description TEXT,
      category TEXT DEFAULT 'Websites & Web Apps',
      image_url TEXT,
      is_published INTEGER DEFAULT 1,
      created_at TEXT
    );
  `);

  // 7. Blog Posts Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      content TEXT,
      excerpt TEXT,
      category TEXT DEFAULT 'Engineering',
      author TEXT DEFAULT 'Codex Team',
      status TEXT DEFAULT 'published',
      featured_image TEXT,
      meta_description TEXT,
      reading_time INTEGER DEFAULT 5,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // 8. Reviews Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      comment TEXT,
      is_published INTEGER DEFAULT 1,
      created_at TEXT
    );
  `);

  // 9. Backlinks Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS backlinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      notes TEXT,
      created_at TEXT
    );
  `);

  // Seed Initial SQL Data if empty
  seedSqlData(db);
}

function seedSqlData(db: SqliteDbInstance) {
  const clientCount = db.prepare('SELECT COUNT(*) as cnt FROM portal_clients').get() as { cnt: number };
  const now = new Date().toISOString();

  if (clientCount.cnt === 0) {
    const insertClient = db.prepare(`
      INSERT INTO portal_clients (id, name, company, email, password, phone, address, country, country_code, status, portal_enabled, tier, last_login_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 1, ?, ?, ?)
    `);

    insertClient.run(
      'client_vance',
      'Eleanor Vance',
      'Vance Tech Capital',
      'eleanor.vance@vancetech.io',
      'client123',
      '+1 (415) 890-2341',
      '450 Mission St, Suite 1800, San Francisco, CA 94105',
      'United States',
      'US',
      'Enterprise Partner',
      new Date(Date.now() - 3600000).toISOString(),
      now
    );

    insertClient.run(
      'client_brody',
      'Marcus Brody',
      'Brody Luxury Goods',
      'marcus@brodydesign.co',
      'client123',
      '+44 20 7946 0912',
      '14 Berkeley Square, Mayfair, London W1J 6BL',
      'United Kingdom',
      'GB',
      'Growth Tier',
      new Date(Date.now() - 7200000).toISOString(),
      now
    );

    insertClient.run(
      'usr_client',
      'Alex Morgan',
      'Morgan Digital Media',
      'client@codexdynamics.com',
      'client123',
      '+1 (555) 234-5678',
      '777 Broadway, 12th Floor, New York, NY 10003',
      'United States',
      'US',
      'Dedicated Agency',
      new Date(Date.now() - 1800000).toISOString(),
      now
    );
  }

  const leadCount = db.prepare('SELECT COUNT(*) as cnt FROM leads').get() as { cnt: number };
  if (leadCount.cnt === 0) {
    const insertLead = db.prepare(`
      INSERT INTO leads (id, first_name, last_name, name, email, phone, country, country_code, stage, status, funnel, company, service, budget, timeline, message, source, notes, client_password, assigned_office_id, assigned_team_id, assigned_agent_id, is_online, comment_history, status_history, appointments, activity_record, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertLead.run(
      'client_vance',
      'Eleanor',
      'Vance',
      'Eleanor Vance',
      'eleanor.vance@vancetech.io',
      '+1 (415) 890-2341',
      'United States',
      'US',
      'New',
      'New',
      'High-Performance Website',
      'Vance Tech Capital',
      'High-Performance Website',
      '$15,000 - $25,000',
      'Within 1 Month',
      'We need a complete rebuild of our venture fund corporate portal with real-time portfolio performance dashboards and interactive investor LP access.',
      'website_contact_modal',
      'High priority lead.',
      'client123',
      'of_london',
      'tm_alpha',
      'adm_ag',
      1,
      JSON.stringify([{ id: 'c1', by_name: 'Website Intake', text: 'Intake submitted via corporate booking modal.', created_at: now }]),
      JSON.stringify([{ id: 's1', from_stage: 'New', to_stage: 'New', by_name: 'System', created_at: now }]),
      JSON.stringify([]),
      JSON.stringify({ pageViews: 28, sessions: 7, lastLogin: new Date(Date.now() - 3600000).toISOString() }),
      now,
      now
    );

    insertLead.run(
      'client_brody',
      'Marcus',
      'Brody',
      'Marcus Brody',
      'marcus@brodydesign.co',
      '+44 20 7946 0912',
      'United Kingdom',
      'GB',
      'In Line',
      'In Line',
      'Web Design & UI/UX',
      'Brody Luxury Goods',
      'Web Design & UI/UX',
      '$10,000 - $18,000',
      'Immediate',
      'Looking for a bespoke e-commerce experience with 3D product previews and ultra-fast mobile checkout.',
      'website_contact_form',
      'Waiting for brand pack.',
      'client123',
      'of_london',
      'tm_alpha',
      'adm_ag',
      0,
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify({ pageViews: 14, sessions: 4, lastLogin: new Date(Date.now() - 7200000).toISOString() }),
      now,
      now
    );

    insertLead.run(
      'ld_1001',
      'James',
      'Morrison',
      'James Morrison',
      'james.morrison@enterprise.co.uk',
      '+44 20 7946 0912',
      'United Kingdom',
      'GB',
      'In Line',
      'In Line',
      'Web Development',
      'Enterprise UK',
      'Web Development',
      '$20,000+',
      '1-2 Months',
      'Requirements discovery for global corporate web platform.',
      'direct',
      'Discovery call completed.',
      'client123',
      'of_london',
      'tm_alpha',
      'adm_ag',
      0,
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify({ pageViews: 19, sessions: 5, lastLogin: new Date(Date.now() - 14400000).toISOString() }),
      now,
      now
    );
  }

  const projCount = db.prepare('SELECT COUNT(*) as cnt FROM projects').get() as { cnt: number };
  if (projCount.cnt === 0) {
    const insertProj = db.prepare(`
      INSERT INTO projects (title, site_name, site_url, description, category, image_url, is_published, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProj.run(
      'Vance Tech Capital Portal',
      'Vance Capital',
      'https://vancetech.io',
      'Next-generation venture capital portfolio management and investor dashboard.',
      'Websites & Web Apps',
      '/hero/web-apps.jpg',
      1,
      now
    );

    insertProj.run(
      'Brody Luxury Storefront',
      'Brody Goods',
      'https://brodydesign.co',
      'Bespoke high-conversion storefront with 3D product previews and instant checkout.',
      'Websites & Web Apps',
      '/hero/design.jpg',
      1,
      now
    );

    insertProj.run(
      'Apex Telephony & CRM Gateway',
      'Apex VoIP',
      'https://apextelecom.net',
      'Omnichannel calling system, VoIP routing, and automated sales pipeline engine.',
      'CRMs & Calling Systems',
      '/services/crm-calling.jpg',
      1,
      now
    );

    insertProj.run(
      'Kroma Digital Studio',
      'Kroma Brand',
      'https://kromastudio.art',
      'Identity guidelines, custom 3D design system, and multi-channel brand assets.',
      'Graphic Design & Branding',
      '/services/graphic-design.jpg',
      1,
      now
    );
  }

  const blogCount = db.prepare('SELECT COUNT(*) as cnt FROM blogs').get() as { cnt: number };
  if (blogCount.cnt === 0) {
    const insertBlog = db.prepare(`
      INSERT INTO blogs (title, slug, content, excerpt, category, author, status, featured_image, meta_description, reading_time, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBlog.run(
      'Engineering High-Throughput Web Applications on Edge Networks',
      'engineering-high-throughput-web-apps-edge',
      '<p>Modern enterprise platforms require sub-100ms global latency and zero-downtime rollouts. In this guide, we dive into how Codex Dynamics engineers edge architectures...</p>',
      'How modern edge networks, reactive client state, and distributed caching unlock instantaneous web experiences.',
      'Engineering',
      'Codex Architecture Team',
      'published',
      '/hero/web-dev.jpg',
      'Architecture blueprints for enterprise high-throughput web applications.',
      4,
      now,
      now
    );

    insertBlog.run(
      'The Blueprint for High-Converting Digital Storefronts',
      'blueprint-high-converting-storefronts',
      '<p>Conversion rate optimization starts with layout clarity, tactile typography, and frictionless checkout flows...</p>',
      'Strategic design patterns and technical optimizations that drive 3x conversion improvements for commerce brands.',
      'Design & UX',
      'Codex Creative Studio',
      'published',
      '/hero/design.jpg',
      'Design patterns and optimizations for high-converting ecommerce storefronts.',
      5,
      now,
      now
    );
  }

  const revCount = db.prepare('SELECT COUNT(*) as cnt FROM reviews').get() as { cnt: number };
  if (revCount.cnt === 0) {
    const insertRev = db.prepare(`
      INSERT INTO reviews (author, rating, comment, is_published, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertRev.run(
      'Eleanor Vance (Vance Tech Capital)',
      5,
      'Codex Dynamics completely transformed our corporate presence. The client portal and real-time reporting have been a game changer for our LP relationships.',
      1,
      now
    );

    insertRev.run(
      'Marcus Brody (Brody Luxury Goods)',
      5,
      'Incredible execution speed and attention to detail. Our mobile conversion went up 42% in the first two weeks post-launch.',
      1,
      now
    );
  }

  const notifCount = db.prepare('SELECT COUNT(*) as cnt FROM notifications').get() as { cnt: number };
  if (notifCount.cnt === 0) {
    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, user_id, title, description, kind, type, is_read, link, sent_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertNotif.run(
      'notif_init_1',
      'client_vance',
      'Project Milestone Reached',
      'Frontend architectural review completed successfully for Vance Capital.',
      'project',
      'project',
      0,
      '/portal/projects',
      'Sarah Admin',
      new Date(Date.now() - 3600000 * 2).toISOString()
    );

    insertNotif.run(
      'notif_init_2',
      null,
      'Platform Security Update',
      'Scheduled infrastructure maintenance completed with zero downtime.',
      'system',
      'domain',
      1,
      '/portal/notifications',
      'System',
      new Date(Date.now() - 86400000).toISOString()
    );
  }

  const msgCount = db.prepare('SELECT COUNT(*) as cnt FROM messages').get() as { cnt: number };
  if (msgCount.cnt === 0) {
    const insertMsg = db.prepare(`
      INSERT INTO messages (id, user_id, sender, sender_name, body, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertMsg.run(
      'msg_init_1',
      'client_vance',
      'client',
      'Eleanor Vance',
      'Hello team, could you please provide an update on the dashboard integration timeline?',
      1,
      new Date(Date.now() - 3600000 * 4).toISOString()
    );

    insertMsg.run(
      'msg_init_2',
      'client_vance',
      'agent',
      'Alex Agent',
      'Hi Eleanor! The dashboard APIs are wired and our team is running final end-to-end load tests today.',
      1,
      new Date(Date.now() - 3600000 * 2).toISOString()
    );
  }

  const audCount = db.prepare('SELECT COUNT(*) as cnt FROM audit_logs').get() as { cnt: number };
  if (audCount.cnt === 0) {
    const insertAud = db.prepare(`
      INSERT INTO audit_logs (id, user_id, client_name, action, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertAud.run(
      'aud_1',
      'client_vance',
      'Eleanor Vance',
      'CLIENT_LOGIN',
      'Logged into Client Portal dashboard from Chrome on macOS',
      '192.168.1.104',
      new Date(Date.now() - 3600000).toISOString()
    );

    insertAud.run(
      'aud_2',
      'client_vance',
      'Eleanor Vance',
      'PAGE_VIEW',
      'Viewed Portfolio Projects and Milestone Deliverables',
      '192.168.1.104',
      new Date(Date.now() - 3500000).toISOString()
    );
  }
}
