import { useState, useMemo } from "react";
import {
  Globe,
  Monitor,
  Compass,
  BarChart2,
  Calendar,
  Share2,
  FileCode,
  TrendingUp,
  Clock,
  Layers,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import type { RegionStat, BrowserStat, DeviceStat, CrmStats, Visitor } from "@/types/crm";
import { CountryFlag } from "./CountryFlag";
import { BrowserBadge } from "./BrowserBadge";

interface AnalyticsTabProps {
  stats: CrmStats;
  regions: RegionStat[];
  browsers: BrowserStat[];
  devices: DeviceStat[];
  visitors?: Visitor[];
}

type TimeRange = "today" | "7d" | "30d" | "all";
type AnalyticsPerspective = "overview" | "regions" | "technology" | "acquisition";

export function AnalyticsTab({
  stats,
  regions: initialRegions,
  browsers: initialBrowsers,
  devices: initialDevices,
  visitors = [],
}: AnalyticsTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [perspective, setPerspective] = useState<AnalyticsPerspective>("overview");

  // Filter visitors based on timeframe
  const filteredVisitors = useMemo(() => {
    if (visitors.length === 0 || timeRange === "all") return visitors;

    const now = new Date().getTime();
    return visitors.filter((v) => {
      if (!v.created_at) return true;
      const created = new Date(v.created_at).getTime();
      if (isNaN(created)) return true;

      const diffHours = (now - created) / (1000 * 60 * 60);
      if (timeRange === "today") return diffHours <= 24;
      if (timeRange === "7d") return diffHours <= 24 * 7;
      if (timeRange === "30d") return diffHours <= 24 * 30;
      return true;
    });
  }, [visitors, timeRange]);

  // Aggregate regions from filtered visitors
  const regions = useMemo(() => {
    const list = filteredVisitors.length > 0 ? filteredVisitors : (timeRange === "all" ? visitors : []);
    if (list.length === 0) {
      return timeRange === "all" ? initialRegions : [];
    }

    const map = new Map<string, { country: string; flag: string; count: number }>();
    for (const v of list) {
      const c = v.country || "Unknown";
      const f = v.flag || "🌐";
      const curr = map.get(c) || { country: c, flag: f, count: 0 };
      curr.count += 1;
      map.set(c, curr);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredVisitors, visitors, initialRegions, timeRange]);

  // Aggregate browsers from filtered visitors
  const browsers = useMemo(() => {
    const list = filteredVisitors.length > 0 ? filteredVisitors : (timeRange === "all" ? visitors : []);
    if (list.length === 0) {
      return timeRange === "all" ? initialBrowsers : [];
    }

    const map = new Map<string, number>();
    for (const v of list) {
      const b = v.browser || "Unknown";
      map.set(b, (map.get(b) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredVisitors, visitors, initialBrowsers, timeRange]);

  // Aggregate devices from filtered visitors
  const devices = useMemo(() => {
    const list = filteredVisitors.length > 0 ? filteredVisitors : (timeRange === "all" ? visitors : []);
    if (list.length === 0) {
      return timeRange === "all" ? initialDevices : [];
    }

    const map = new Map<string, number>();
    for (const v of list) {
      const d = v.device || "Unknown";
      map.set(d, (map.get(d) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredVisitors, visitors, initialDevices, timeRange]);

  // Aggregate referrers from filtered visitors
  const referrers = useMemo(() => {
    const list = filteredVisitors.length > 0 ? filteredVisitors : visitors;
    if (list.length === 0) {
      return [
        { source: "Direct Traffic", count: stats.totalVisitors, pct: 100 },
      ];
    }

    const map = new Map<string, number>();
    for (const v of list) {
      let ref = v.referrer || "Direct / Bookmark";
      try {
        if (ref.startsWith("http")) {
          const u = new URL(ref);
          ref = u.hostname.replace(/^www\./, "");
        }
      } catch {
        // use raw
      }
      map.set(ref, (map.get(ref) || 0) + 1);
    }

    const total = list.length || 1;
    return Array.from(map.entries())
      .map(([source, count]) => ({
        source,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [filteredVisitors, visitors, stats.totalVisitors]);

  // Top Pages
  const topPages = useMemo(() => {
    const list = filteredVisitors.length > 0 ? filteredVisitors : visitors;
    if (list.length === 0) {
      return [
        { page: "/", count: stats.totalVisitors, pct: 100 },
      ];
    }

    const map = new Map<string, number>();
    for (const v of list) {
      const p = v.page_url || "/";
      map.set(p, (map.get(p) || 0) + 1);
    }

    const total = list.length || 1;
    return Array.from(map.entries())
      .map(([page, count]) => ({
        page,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [filteredVisitors, visitors, stats.totalVisitors]);

  const totalRegionCount = regions.reduce((acc, r) => acc + r.count, 0) || 1;
  const totalBrowserCount = browsers.reduce((acc, b) => acc + b.count, 0) || 1;
  const totalDeviceCount = devices.reduce((acc, d) => acc + d.count, 0) || 1;

  const currentCount = timeRange === "all" ? stats.totalVisitors : filteredVisitors.length;

  const mobileCount = devices.find((d) => d.device.toLowerCase().includes("mobile"))?.count || 0;
  const mobilePct = devices.length > 0 ? Math.round((mobileCount / totalDeviceCount) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* 1. Master Command Header */}
      <div className="p-5 sm:p-6 border-b border-black/[0.06] bg-gradient-to-b from-[#FAFBFD] to-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
              <BarChart2 className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                Traffic Intelligence & Demographics
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Real-time regional telemetry, client hardware profiles, and digital acquisition channels.
              </p>
            </div>
          </div>
        </div>

        {/* Dual Control Island: Time Range + Perspective Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Perspective View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#F2F2F7] rounded-xl border border-black/[0.04]">
            {(
              [
                { id: "overview", label: "Executive Overview", icon: Layers },
                { id: "regions", label: "Geography", icon: Globe },
                { id: "technology", label: "Hardware & Tech", icon: Monitor },
                { id: "acquisition", label: "Channels", icon: Share2 },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPerspective(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  perspective === id
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Time Window Selector */}
          <div className="flex items-center gap-1 p-1 bg-[#F2F2F7] rounded-xl border border-black/[0.04]">
            <Calendar className="size-3.5 text-neutral-400 ml-1.5 mr-0.5" />
            {(
              [
                { key: "today", label: "Today" },
                { key: "7d", label: "7D" },
                { key: "30d", label: "30D" },
                { key: "all", label: "All" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTimeRange(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  timeRange === key
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Integrated Executive KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-black/[0.06] bg-[#F9F9FB] divide-x divide-y lg:divide-y-0 divide-black/[0.06]">
        <div className="p-4 sm:px-6">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span className="font-medium">Audited Sessions</span>
            <Clock className="size-3.5 text-[#0071E3]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 tabular-nums tracking-tight">
            {currentCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-[#0071E3]" />
            <span>{timeRange === "all" ? "All recorded traffic" : `Filtered window: ${timeRange}`}</span>
          </p>
        </div>

        <div className="p-4 sm:px-6">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span className="font-medium">Global Regions</span>
            <Globe className="size-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 tabular-nums tracking-tight">
            {regions.length}
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>International markets</span>
          </p>
        </div>

        <div className="p-4 sm:px-6">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span className="font-medium">Mobile Viewports</span>
            <TrendingUp className="size-3.5 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 tabular-nums tracking-tight">
            {mobilePct}%
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-purple-500" />
            <span>Handheld iOS & Android</span>
          </p>
        </div>

        <div className="p-4 sm:px-6">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
            <span className="font-medium">Primary Acquisition</span>
            <Share2 className="size-3.5 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-neutral-900 truncate tracking-tight">
            {referrers[0]?.source || "Direct Traffic"}
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>{referrers[0] ? `${referrers[0].pct}% of inbound flow` : "Direct navigation"}</span>
          </p>
        </div>
      </div>

      {/* 3. Unified Viewport Body */}
      {perspective === "overview" && (
        <div className="divide-y divide-black/[0.06]">
          {/* Top Half: Geography + Hardware Bento */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black/[0.06]">
            {/* Top Geographic Breakdown (7 cols) */}
            <div className="lg:col-span-7 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-[#0071E3]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Geographic Demographics & Country Reach
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">
                  {regions.length} Countries
                </span>
              </div>

              <div className="space-y-3">
                {regions.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-400">
                    No country data registered for this timeframe.
                  </div>
                ) : (
                  regions.slice(0, 6).map((r, i) => {
                    const pct = Math.round((r.count / totalRegionCount) * 100);
                    return (
                      <div key={r.country || i} className="group p-2 rounded-xl hover:bg-neutral-50/80 transition">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <CountryFlag country={r.country} flag={r.flag} size="sm" />
                            <span className="font-semibold text-neutral-900">{r.country}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="font-bold text-neutral-900">{r.count.toLocaleString()}</span>
                            <span className="text-neutral-500">({pct}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#0071E3] to-[#0077ED] h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Hardware & Browser Engines (5 cols) */}
            <div className="lg:col-span-5 p-5 sm:p-6 space-y-6 bg-[#FAFBFD]">
              {/* Browser Engines */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                  <div className="flex items-center gap-2">
                    <Compass className="size-4 text-purple-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                      Browser Market Share
                    </h3>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">Telemetry</span>
                </div>

                <div className="space-y-2.5">
                  {browsers.slice(0, 4).map((b, i) => {
                    const pct = Math.round((b.count / totalBrowserCount) * 100);
                    return (
                      <div key={b.browser || i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <BrowserBadge browser={b.browser} showFull size="sm" />
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="font-semibold text-neutral-900">{b.count}</span>
                            <span className="text-neutral-500">({pct}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Device Hardware */}
              <div className="space-y-3.5 pt-4 border-t border-black/[0.06]">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                  <div className="flex items-center gap-2">
                    <Monitor className="size-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                      Device Form Factors
                    </h3>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">Viewports</span>
                </div>

                <div className="space-y-2.5">
                  {devices.slice(0, 3).map((d, i) => {
                    const pct = Math.round((d.count / totalDeviceCount) * 100);
                    return (
                      <div key={d.device || i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-neutral-800">{d.device}</span>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="font-semibold text-neutral-900">{d.count}</span>
                            <span className="text-neutral-500">({pct}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Half: Referral Sources & Top Landing Pages Integrated Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-black/[0.06]">
            {/* Referral Channels */}
            <div className="p-5 sm:p-6 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <Share2 className="size-4 text-[#0071E3]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Traffic Acquisition Channels
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">Referral Headers</span>
              </div>

              <div className="space-y-2">
                {referrers.map((ref, i) => (
                  <div key={ref.source || i} className="p-2 rounded-xl hover:bg-neutral-50/80 transition space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-800 truncate pr-2">{ref.source}</span>
                      <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                        <span className="font-bold text-neutral-900">{ref.count}</span>
                        <span className="text-neutral-500">({ref.pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-[#0071E3] h-1 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(ref.pct, 3)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Landing Pages */}
            <div className="p-5 sm:p-6 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <FileCode className="size-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Top Visited Landing Pages
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">Route Dwell</span>
              </div>

              <div className="space-y-2">
                {topPages.map((pg, i) => (
                  <div key={pg.page || i} className="p-2 rounded-xl hover:bg-neutral-50/80 transition space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-xs text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded-md border border-black/[0.04] truncate max-w-[240px]">
                        {pg.page}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                        <span className="font-bold text-neutral-900">{pg.count}</span>
                        <span className="text-neutral-500">({pg.pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pg.pct, 3)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deep Dive Perspective 1: Geography */}
      {perspective === "regions" && (
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Complete Country & Territory Distribution</h3>
              <p className="text-xs text-neutral-500">Telemetry aggregated across all visitors in selected timeframe.</p>
            </div>
            <span className="text-xs font-mono text-[#0071E3] font-semibold bg-[#0071E3]/10 px-2.5 py-1 rounded-lg">
              {regions.length} Active Nations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {regions.map((r, i) => {
              const pct = Math.round((r.count / totalRegionCount) * 100);
              return (
                <div
                  key={r.country || i}
                  className="p-3.5 rounded-xl border border-black/[0.06] bg-[#F9F9FB] hover:bg-white hover:border-black/[0.12] transition shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CountryFlag country={r.country} flag={r.flag} size="md" />
                      <span className="text-xs font-bold text-neutral-900">{r.country}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#0071E3]">{r.count}</span>
                  </div>
                  <div className="w-full bg-neutral-200/80 rounded-full h-1.5 overflow-hidden mb-1">
                    <div
                      className="bg-[#0071E3] h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono block text-right">
                    {pct}% of recorded traffic
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deep Dive Perspective 2: Technology & Hardware */}
      {perspective === "technology" && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Browsers Table */}
            <div className="p-4 rounded-xl border border-black/[0.06] bg-[#F9F9FB] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <Compass className="size-4 text-purple-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Browsing Engines & User Agents
                  </h4>
                </div>
                <span className="text-xs font-mono text-neutral-500">{browsers.length} Detected</span>
              </div>
              <div className="space-y-2">
                {browsers.map((b, i) => {
                  const pct = Math.round((b.count / totalBrowserCount) * 100);
                  return (
                    <div key={b.browser || i} className="p-2 rounded-lg bg-white border border-black/[0.04] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <BrowserBadge browser={b.browser} showFull size="sm" />
                        <span className="font-mono font-bold text-neutral-900">{b.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Devices Table */}
            <div className="p-4 rounded-xl border border-black/[0.06] bg-[#F9F9FB] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <Monitor className="size-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Hardware Form Factors
                  </h4>
                </div>
                <span className="text-xs font-mono text-neutral-500">{devices.length} Classes</span>
              </div>
              <div className="space-y-2">
                {devices.map((d, i) => {
                  const pct = Math.round((d.count / totalDeviceCount) * 100);
                  return (
                    <div key={d.device || i} className="p-2.5 rounded-lg bg-white border border-black/[0.04] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {d.device.toLowerCase().includes("mobile") ? (
                            <Smartphone className="size-3.5 text-emerald-600" />
                          ) : (
                            <Monitor className="size-3.5 text-neutral-600" />
                          )}
                          <span className="font-semibold text-neutral-800">{d.device}</span>
                        </div>
                        <span className="font-mono font-bold text-neutral-900">{d.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deep Dive Perspective 3: Acquisition & Landing Pages */}
      {perspective === "acquisition" && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inbound Referrals */}
            <div className="p-4 rounded-xl border border-black/[0.06] bg-[#F9F9FB] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <Share2 className="size-4 text-[#0071E3]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Inbound Referrer Domains
                  </h4>
                </div>
                <span className="text-xs font-mono text-neutral-500">{referrers.length} Sources</span>
              </div>
              <div className="space-y-2">
                {referrers.map((ref, i) => (
                  <div key={ref.source || i} className="p-2.5 rounded-lg bg-white border border-black/[0.04] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-800">{ref.source}</span>
                      <span className="font-mono font-bold text-[#0071E3]">{ref.count} ({ref.pct}%)</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#0071E3] h-1.5 rounded-full" style={{ width: `${ref.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Landing Routes */}
            <div className="p-4 rounded-xl border border-black/[0.06] bg-[#F9F9FB] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <FileCode className="size-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Top Page Routes by Inbound Traffic
                  </h4>
                </div>
                <span className="text-xs font-mono text-neutral-500">{topPages.length} Routes</span>
              </div>
              <div className="space-y-2">
                {topPages.map((pg, i) => (
                  <div key={pg.page || i} className="p-2.5 rounded-lg bg-white border border-black/[0.04] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-medium text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {pg.page}
                      </span>
                      <span className="font-mono font-bold text-emerald-700">{pg.count} ({pg.pct}%)</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${pg.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Audit Signature */}
      <div className="p-4 bg-[#FAFBFD] border-t border-black/[0.06] flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-3.5 text-emerald-600" />
          <span>Real-time SQLite server telemetry with zero third-party cookie dependencies</span>
        </div>
        <span className="font-mono text-[11px] text-neutral-400">
          Showing {timeRange === "all" ? "full history" : `window: ${timeRange}`}
        </span>
      </div>
    </div>
  );
}
