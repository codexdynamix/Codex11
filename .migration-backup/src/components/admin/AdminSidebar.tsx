import {
  Activity,
  BarChart3,
  Inbox,
  Link2,
  FileText,
  Star,
  Briefcase,
  LogOut,
  X,
  ChevronRight,
  Shield,
  Users,
  MessageSquare,
  Globe,
  Palette,
  Layout,
  Megaphone,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { CrmStats } from "@/types/crm";
import { useSiteConfig } from "@/context/SiteConfigContext";

export type AdminTabKey =
  | "customizer"
  | "branding"
  | "layout"
  | "conversion"
  | "seo_suite"
  | "emergency"
  | "content"
  | "site_content"
  | "tidio"
  | "visitors"
  | "leads"
  | "analytics"
  | "backlinks"
  | "blogs"
  | "enquiries"
  | "reviews"
  | "projects"
  | "settings";

interface AdminSidebarProps {
  activeTab: AdminTabKey;
  setActiveTab: (tab: AdminTabKey) => void;
  stats: CrmStats;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenHostingerModal: () => void;
  onSimulateVisitor: () => void;
  onLogout: () => void;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  stats,
  isOpenMobile,
  onCloseMobile,
  onOpenHostingerModal: _onOpenHostingerModal,
  onSimulateVisitor: _onSimulateVisitor,
  onLogout,
}: AdminSidebarProps) {
  const { config } = useSiteConfig();
  const isMaintenance = Boolean(config.emergency?.maintenanceMode);

  const navSections = [
    {
      group: "Design & Site Customizer",
      items: [
        {
          id: "branding" as const,
          label: "Visual Branding & Colors",
          icon: Palette,
          count: null,
          badgeLive: false,
          badgeText: "Theme",
        },
        {
          id: "layout" as const,
          label: "Layout & Sections",
          icon: Layout,
          count: null,
          badgeLive: false,
          badgeText: null,
        },
        {
          id: "conversion" as const,
          label: "Conversion & Docks",
          icon: Megaphone,
          count: null,
          badgeLive: false,
          badgeText: "WhatsApp",
        },
        {
          id: "seo_suite" as const,
          label: "SEO & Social Sharing",
          icon: Globe,
          count: null,
          badgeLive: false,
          badgeText: "SERP",
        },
        {
          id: "emergency" as const,
          label: "Emergency & Backups",
          icon: AlertTriangle,
          count: null,
          badgeLive: isMaintenance,
          badgeText: isMaintenance ? "ALERT" : null,
          badgeAlert: isMaintenance,
        },
        {
          id: "content" as const,
          label: "Contacts & Copy",
          icon: Phone,
          count: null,
          badgeLive: false,
          badgeText: null,
        },
      ],
    },
    {
      group: "Live Telemetry & Chat",
      items: [
        {
          id: "tidio" as const,
          label: "Live Chat & Inbox",
          icon: MessageSquare,
          count:
            stats.unreadChatCount && stats.unreadChatCount > 0
              ? stats.unreadChatCount
              : stats.activeChatThreads || null,
          badgeLive: Boolean(stats.activeChatThreads && stats.activeChatThreads > 0),
          badgeText:
            stats.unreadChatCount && stats.unreadChatCount > 0
              ? `${stats.unreadChatCount} new`
              : null,
          badgeAlert: Boolean(stats.unreadChatCount && stats.unreadChatCount > 0),
        },
        {
          id: "visitors" as const,
          label: "Live Visitors",
          icon: Activity,
          count: stats.totalVisitors,
          badgeLive: true,
          badgeText: null,
        },
        {
          id: "analytics" as const,
          label: "Analytics & Regions",
          icon: BarChart3,
          count: null,
          badgeLive: false,
          badgeText: null,
        },
      ],
    },
    {
      group: "Clients & Pipeline",
      items: [
        {
          id: "leads" as const,
          label: "CRM Leads",
          icon: Users,
          count: stats.totalLeads ?? 0,
          badgeLive: (stats.newLeads ?? 0) > 0,
          badgeText: null,
        },
        {
          id: "enquiries" as const,
          label: "Inquiries",
          icon: Inbox,
          count: stats.totalEnquiries,
          badgeLive: false,
          badgeText: null,
        },
        {
          id: "reviews" as const,
          label: "Client Reviews",
          icon: Star,
          count: stats.totalReviews,
          badgeLive: false,
          badgeText: null,
        },
      ],
    },
    {
      group: "Content & Portfolio",
      items: [
        {
          id: "blogs" as const,
          label: "Rank Math Blogs",
          icon: FileText,
          count: stats.totalBlogs,
          badgeLive: false,
          badgeText: null,
        },
        {
          id: "backlinks" as const,
          label: "SEO Backlinks",
          icon: Link2,
          count: stats.totalBacklinks,
          badgeLive: false,
          badgeText: null,
        },
        {
          id: "projects" as const,
          label: "Portfolio Showcase",
          icon: Briefcase,
          count: stats.totalProjects,
          badgeLive: false,
          badgeText: null,
        },
      ],
    },
    {
      group: "System & Settings",
      items: [
        {
          id: "settings" as const,
          label: "Security & Database",
          icon: Shield,
          count: null,
          badgeLive: false,
          badgeText: "SQLite",
        },
      ],
    },
  ];

  const handleSelectTab = (id: AdminTabKey) => {
    setActiveTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FBFBFC] border-r border-black/[0.06] select-none">
      {/* Brand Header - Apple Mac/iPad app header style */}
      <div className="p-4 pb-3.5 border-b border-black/[0.05] flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none"
          onClick={() => {
            if (typeof window !== "undefined") {
              sessionStorage.setItem("codex_return_to_public", "true");
              sessionStorage.removeItem("codex_on_admin");
              localStorage.removeItem("codex_on_admin");
            }
            onCloseMobile();
          }}
        >
          {/* iOS App Icon Squircle */}
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-b from-[#0077ED] to-[#0066CC] text-white shadow-[0_2px_5px_rgba(0,102,204,0.25),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-200 group-hover:scale-105">
            <span className="text-base font-bold tracking-tight">C</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-neutral-900">
                Codex Dynamics
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#0071E3]/10 text-[#0071E3] tracking-wide uppercase">
                Pro
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-neutral-500 font-medium">
                Admin Console
              </span>
            </div>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-3.5 space-y-5 overflow-y-auto custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.group} className="space-y-1">
            {/* Clear, legible Apple-style section header */}
            <div className="px-3 pt-1 pb-1 text-[10px] font-bold tracking-wider uppercase text-neutral-400 font-sans select-none">
              {section.group}
            </div>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-[#0071E3] text-white shadow-[0_1px_4px_rgba(0,113,227,0.25)] font-semibold"
                        : "text-neutral-700 hover:text-neutral-900 hover:bg-black/[0.035]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`size-4 shrink-0 transition-colors ${
                          isActive ? "text-white" : "text-neutral-400"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.badgeLive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              isActive ? "bg-white" : "bg-emerald-500"
                            }`}
                          />
                        </span>
                      )}

                      {item.badgeText && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium tracking-wide ${
                            isActive
                              ? "bg-white/20 text-white font-semibold"
                              : item.badgeAlert
                                ? "bg-red-500 text-white font-semibold"
                                : "bg-black/[0.05] text-neutral-600 font-medium"
                          }`}
                        >
                          {item.badgeText}
                        </span>
                      )}

                      {typeof item.count === "number" && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-md font-medium font-mono ${
                            isActive
                              ? "bg-white/20 text-white font-semibold"
                              : "bg-black/[0.04] text-neutral-600"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}

                      {isActive && (
                        <ChevronRight className="size-3.5 text-white/80 shrink-0 ml-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin User Footer Card - Apple ID Style */}
      <div className="p-3 border-t border-black/[0.05] bg-white/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-black/[0.05] shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold shrink-0 shadow-2xs">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-neutral-900 truncate">
                Codex Admin
              </span>
              <span className="text-[11px] text-neutral-500 truncate">
                admin@codexdynamics.com
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0 ml-1"
            title="Sign Out of Back Office"
            aria-label="Sign Out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Content */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 ease-in-out lg:hidden shadow-2xl ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
