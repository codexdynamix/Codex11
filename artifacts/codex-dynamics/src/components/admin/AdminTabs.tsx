import {
  Activity,
  BarChart3,
  Link2,
  FileText,
  Inbox,
  Star,
  Briefcase,
} from "lucide-react";
import type { CrmStats } from "@/types/crm";

interface AdminTabsProps {
  activeTab: "visitors" | "analytics" | "backlinks" | "blogs" | "enquiries" | "reviews" | "projects";
  setActiveTab: (tab: "visitors" | "analytics" | "backlinks" | "blogs" | "enquiries" | "reviews" | "projects") => void;
  stats: CrmStats;
}

export function AdminTabs({ activeTab, setActiveTab, stats }: AdminTabsProps) {
  const tabs = [
    {
      id: "visitors" as const,
      label: "Live Visitors",
      icon: Activity,
      count: stats.totalVisitors,
      badgeLive: true,
    },
    {
      id: "analytics" as const,
      label: "Analytics & Regions",
      icon: BarChart3,
      count: null,
    },
    {
      id: "enquiries" as const,
      label: "Inquiries & Leads",
      icon: Inbox,
      count: stats.totalEnquiries,
    },
    {
      id: "backlinks" as const,
      label: "SEO Backlinks",
      icon: Link2,
      count: stats.totalBacklinks,
    },
    {
      id: "blogs" as const,
      label: "Blogs & Rank Math",
      icon: FileText,
      count: stats.totalBlogs,
    },
    {
      id: "reviews" as const,
      label: "Reviews",
      icon: Star,
      count: stats.totalReviews,
    },
    {
      id: "projects" as const,
      label: "Projects",
      icon: Briefcase,
      count: stats.totalProjects,
    },
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-1">
      <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#e8e8ed]/90 border border-black/6 shadow-inner backdrop-blur-md min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-label shadow-sm font-semibold ring-1 ring-black/5"
                  : "text-muted-foreground hover:text-label hover:bg-white/40"
              }`}
            >
              <Icon className={`size-3.5 ${isActive ? "text-blue" : "text-subtle"}`} />
              <span>{tab.label}</span>

              {tab.badgeLive && (
                <span className="relative flex h-2 w-2 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}

              {typeof tab.count === "number" && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isActive
                      ? "bg-blue/10 text-blue font-semibold"
                      : "bg-black/5 text-subtle"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
