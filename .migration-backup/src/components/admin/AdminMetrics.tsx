import {
  Users,
  UserPlus,
  Link2,
  FileText,
  Star,
  Briefcase,
  Contact,
} from "lucide-react";
import type { CrmStats } from "@/types/crm";
import type { AdminTabKey } from "./AdminSidebar";

interface AdminMetricsProps {
  stats: CrmStats;
  activeTab: string;
  setActiveTab: (tab: AdminTabKey) => void;
}

export function AdminMetrics({ stats, activeTab, setActiveTab }: AdminMetricsProps) {
  const items = [
    {
      id: "visitors" as const,
      title: "Live Visitors",
      value: stats.totalVisitors,
      subValue: `+${stats.todayVisitors} today`,
      icon: Users,
    },
    {
      id: "leads" as const,
      title: "CRM Leads",
      value: stats.totalLeads ?? 0,
      subValue: `${stats.newLeads ?? 0} new active`,
      icon: Contact,
    },
    {
      id: "enquiries" as const,
      title: "Inquiries",
      value: stats.totalEnquiries,
      subValue: "Form inquiries",
      icon: UserPlus,
    },
    {
      id: "backlinks" as const,
      title: "Backlinks",
      value: stats.totalBacklinks,
      subValue: "Indexed domains",
      icon: Link2,
    },
    {
      id: "blogs" as const,
      title: "Blog Posts",
      value: stats.totalBlogs,
      subValue: "Published SEO",
      icon: FileText,
    },
    {
      id: "reviews" as const,
      title: "Reviews",
      value: stats.totalReviews,
      subValue: "5.0 ★ average",
      icon: Star,
    },
    {
      id: "projects" as const,
      title: "Showcase",
      value: stats.totalProjects,
      subValue: "Live projects",
      icon: Briefcase,
    },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.02)] p-2 transition-all">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`group flex flex-col p-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-[#0071E3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.28)]"
                  : "bg-neutral-50/50 hover:bg-neutral-100/90 text-neutral-800 hover:shadow-2xs hover:-translate-y-0.5 border border-transparent hover:border-black/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span
                  className={`text-[11px] font-medium tracking-wide truncate ${
                    isSelected ? "text-white/85" : "text-neutral-500 group-hover:text-neutral-700"
                  }`}
                >
                  {item.title}
                </span>
                <div
                  className={`size-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    isSelected
                      ? "bg-white/15 text-white"
                      : "bg-white text-neutral-500 group-hover:text-neutral-700 shadow-2xs border border-black/[0.04]"
                  }`}
                >
                  <Icon className="size-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-xl sm:text-2xl font-bold tracking-tight font-sans tabular-nums ${
                    isSelected ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {item.value}
                </span>
              </div>

              <div
                className={`text-[11px] mt-1 truncate font-medium ${
                  isSelected ? "text-white/80" : "text-neutral-400 group-hover:text-neutral-500"
                }`}
              >
                {item.subValue}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
