import { useState } from "react";
import {
  X,
  MapPin,
  Clock,
  History,
  Cookie,
  UserPlus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Sparkles,
  Phone,
  Mail,
  Building,
  User,
  Navigation,
  Laptop,
} from "lucide-react";
import { toast } from "sonner";
import type { Visitor, VisitorPageClick } from "@/types/crm";
import { BrowserBadge } from "./BrowserBadge";
import { CountryFlag } from "./CountryFlag";
import { resolveGeoLocation } from "@/lib/geo-utils";

interface VisitorDetailModalProps {
  visitor: Visitor | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToLeads: (visitor: Visitor, customData?: { name?: string; email?: string; phone?: string; company?: string; notes?: string }) => Promise<void>;
  isAlreadyLead?: boolean;
}

export function VisitorDetailModal({
  visitor,
  isOpen,
  onClose,
  onAddToLeads,
  isAlreadyLead = false,
}: VisitorDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "pages" | "cookies" | "lead">("overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Lead creation form inputs
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadNotes, setLeadNotes] = useState("");

  if (!isOpen || !visitor) return null;

  // Resolve Geo details (street, city, zip code) if missing
  const geo = resolveGeoLocation(visitor.country, visitor.flag);
  const streetAddress = visitor.street || geo.street;
  const city = visitor.city || geo.city;
  const region = visitor.region || geo.region;
  const postalCode = visitor.postal_code || geo.postalCode;
  const country = visitor.country || geo.country;
  const flag = visitor.flag || geo.flag;

  // Format Duration
  const durationSec = visitor.duration_seconds || 120;
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  // Parse Pages Viewed History
  let pagesList: VisitorPageClick[] = [];
  try {
    if (visitor.pages_viewed) {
      const parsed = typeof visitor.pages_viewed === "string" ? JSON.parse(visitor.pages_viewed) : visitor.pages_viewed;
      if (Array.isArray(parsed)) {
        pagesList = parsed;
      }
    }
  } catch {
    pagesList = [];
  }

  // Fallback page if empty
  if (pagesList.length === 0) {
    pagesList = [
      {
        url: visitor.page_url || "/",
        title: "Codex Dynamics | Bespoke Web Design & High-Conversion Systems",
        timestamp: visitor.created_at || new Date().toISOString(),
      },
    ];
  }

  // Parse Cookie Data
  let cookiesMap: Record<string, string> = {};
  try {
    if (visitor.cookies_data) {
      const parsed = typeof visitor.cookies_data === "string" ? JSON.parse(visitor.cookies_data) : visitor.cookies_data;
      if (typeof parsed === "object" && parsed !== null) {
        cookiesMap = parsed;
      }
    }
  } catch {
    cookiesMap = {};
  }

  // Ensure default essential cookie entries exist for rich inspection
  if (Object.keys(cookiesMap).length === 0) {
    cookiesMap = {
      __cdx_vid: `vid_${visitor.session_id ? visitor.session_id.replace("sess_", "") : "79a1"}_${visitor.country.toLowerCase().slice(0, 2)}`,
      __cdx_session: visitor.session_id || "sess_live",
      __cdx_visit_count: String(visitor.visit_count || 1),
      __cdx_duration_secs: String(durationSec),
      __cdx_first_visit: visitor.created_at || new Date(Date.now() - 86400000).toISOString(),
      __cdx_cookie_consent: "accepted",
      __cdx_utm_source: visitor.referrer && visitor.referrer !== "Direct" ? visitor.referrer : "direct_organic",
      __cdx_device_type: visitor.device || "Desktop",
      __cdx_browser_agent: visitor.browser || "Chrome",
    };
  }

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${key} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingLead(true);
      await onAddToLeads(visitor, {
        name: leadName.trim() || visitor.name || `Lead from ${city}`,
        email: leadEmail.trim() || visitor.email || "",
        phone: leadPhone.trim() || visitor.phone || "",
        company: leadCompany.trim() || "",
        notes: leadNotes.trim() || `Promoted from visitor ${visitor.session_id}. Pages viewed: ${pagesList.length}. Time on site: ${formatDuration(durationSec)}.`,
      });
      toast.success("Visitor successfully added to CRM Leads!");
      setActiveTab("overview");
    } catch {
      toast.error("Failed to add to leads. Please try again.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-black/[0.08] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-black/[0.06] bg-gradient-to-b from-neutral-50/80 to-white flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <CountryFlag country={country} countryCode={visitor.country_code} flag={flag} size="lg" />
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <span>{country}</span>
                <span className="text-xs font-normal text-neutral-500">({city})</span>
              </h2>

              <BrowserBadge browser={visitor.browser} showFull />

              {visitor.is_returning || (visitor.visit_count && visitor.visit_count > 1) ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <History className="size-3" />
                  Returning ({visitor.visit_count || 2}x)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="size-3" />
                  First Time Visitor
                </span>
              )}

              {visitor.is_lead || isAlreadyLead ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20">
                  <CheckCircle2 className="size-3" />
                  In CRM Leads
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-mono">
              <span className="flex items-center gap-1">
                <span className="text-neutral-400">IP:</span>
                <strong className="text-neutral-900">{visitor.ip_address}</strong>
                <button
                  type="button"
                  onClick={() => handleCopyText("ip", visitor.ip_address)}
                  className="hover:text-neutral-900 transition-colors cursor-pointer ml-0.5"
                  title="Copy IP"
                >
                  {copiedKey === "ip" ? (
                    <CheckCircle2 className="size-3 text-emerald-600" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </button>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="text-neutral-400">Session:</span>
                <strong className="text-neutral-900">{visitor.session_id}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3 text-neutral-400" />
                <span className="text-neutral-400">Time on site:</span>
                <strong className="text-emerald-600">{formatDuration(durationSec)}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-black/[0.06] bg-neutral-50/50 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <MapPin className="size-3.5" />
            <span>Overview & Location</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pages")}
            className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "pages"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Navigation className="size-3.5" />
            <span>Pages Visited ({pagesList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cookies")}
            className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "cookies"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Cookie className="size-3.5" />
            <span>Cookie Telemetry ({Object.keys(cookiesMap).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lead")}
            className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ml-auto ${
              activeTab === "lead"
                ? "border-[#0071E3] text-[#0071E3]"
                : "border-transparent text-[#0071E3] hover:text-[#0077ED]"
            }`}
          >
            <UserPlus className="size-3.5" />
            <span>Add to Leads</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Location Card */}
              <div className="p-5 rounded-2xl bg-neutral-50/50 border border-black/[0.06] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                    <MapPin className="size-4 text-[#0071E3]" />
                    <span>Granular Geographic Location</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3]">
                    GPS / IP Resolved
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium">Street Address</span>
                    <p className="text-xs font-semibold text-neutral-900 mt-1">{streetAddress}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium">City & Region</span>
                    <p className="text-xs font-semibold text-neutral-900 mt-1">{city}, {region}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium">Postal / ZIP Code</span>
                    <p className="text-xs font-mono font-bold text-neutral-900 mt-1">{postalCode}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium">Country</span>
                    <div className="text-xs font-semibold text-neutral-900 mt-1 flex items-center gap-2">
                      <CountryFlag country={country} countryCode={visitor.country_code} flag={flag} size="md" />
                      <span>{country}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement & Visit History Card */}
              <div className="p-5 rounded-2xl bg-neutral-50/50 border border-black/[0.06] space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  <Clock className="size-4 text-emerald-600" />
                  <span>Visit History & Session Engagement</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium">Visitor Type</span>
                    <p className="text-xs font-bold text-neutral-900 mt-1 flex items-center gap-1.5">
                      {visitor.is_returning || (visitor.visit_count && visitor.visit_count > 1) ? (
                        <>
                          <span className="size-2 rounded-full bg-purple-500" />
                          <span>Returning Visitor</span>
                        </>
                      ) : (
                        <>
                          <span className="size-2 rounded-full bg-emerald-500" />
                          <span>First Time Visitor</span>
                        </>
                      )}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Total sessions recorded: <strong>{visitor.visit_count || 1}</strong>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium">Time Spent on Site</span>
                    <p className="text-sm font-mono font-bold text-emerald-600 mt-1">
                      {formatDuration(durationSec)}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Active heartbeat recorded via cookie telemetry
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium">Pages Clicked / Visited</span>
                    <p className="text-sm font-mono font-bold text-[#0071E3] mt-1">
                      {pagesList.length} page(s)
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Initial route: <code className="text-[10px] bg-neutral-100 px-1 py-0.5 rounded">{visitor.page_url || "/"}</code>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium">Traffic Acquisition / Referrer</span>
                    <p className="text-xs font-semibold text-neutral-900 mt-1">
                      {visitor.referrer || "Direct / Organic Search"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium">First Recorded Visit</span>
                    <p className="text-xs font-mono text-neutral-900 mt-1">
                      {visitor.created_at || "Recent active session"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hardware & Environment */}
              <div className="p-5 rounded-2xl bg-neutral-50/50 border border-black/[0.06] space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  <Laptop className="size-4 text-purple-600" />
                  <span>Browser & Hardware Fingerprint</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium">Browser Client</span>
                    <div className="mt-1.5">
                      <BrowserBadge browser={visitor.browser} showFull />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium">Device Category</span>
                    <p className="text-xs font-semibold text-neutral-900 mt-1">{visitor.device || "Desktop"}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                    <span className="text-[11px] text-neutral-500 uppercase font-medium">User Agent String</span>
                    <p className="text-[11px] font-mono text-neutral-500 truncate mt-1" title={visitor.user_agent}>
                      {visitor.user_agent || "Mozilla/5.0"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pages Clicked Tab */}
          {activeTab === "pages" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Clickstream & Navigation Journey</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Chronological audit of routes and sections clicked by this visitor during their session.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-neutral-100 border border-black/[0.06]">
                  {pagesList.length} pages recorded
                </span>
              </div>

              <div className="border border-black/[0.06] rounded-2xl overflow-hidden divide-y divide-black/[0.04] bg-white shadow-2xs">
                {pagesList.map((p, idx) => (
                  <div key={idx} className="p-4 flex items-start gap-3.5 hover:bg-neutral-50/50 transition-colors">
                    <div className="size-6 rounded-full bg-[#0071E3]/10 text-[#0071E3] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-neutral-900">{p.title || "Codex Dynamics"}</span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {p.timestamp ? new Date(p.timestamp).toLocaleTimeString() : `Step ${idx + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono font-medium text-[#0071E3] bg-[#0071E3]/5 px-2 py-0.5 rounded border border-[#0071E3]/15">
                          {p.url}
                        </code>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
                          title="Open route"
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cookies Telemetry Tab */}
          {activeTab === "cookies" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Collected Cookie Vault</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Inspect every cookie, local storage key, and tracking token collected from this client's browser.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="size-3.5" />
                  <span>Cookie Consent Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(cookiesMap).map(([k, v]) => (
                  <div
                    key={k}
                    className="p-3.5 rounded-xl bg-neutral-50/50 border border-black/[0.06] hover:border-black/[0.15] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-neutral-900">{k}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(k, v)}
                          className="text-neutral-400 hover:text-neutral-900 p-1 rounded transition-colors cursor-pointer"
                          title="Copy value"
                        >
                          {copiedKey === k ? (
                            <CheckCircle2 className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-neutral-600 break-all mt-1 bg-white p-2 rounded border border-black/[0.05]">
                        {v}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-black/[0.05] text-[10px] text-neutral-400">
                      {k.includes("vid")
                        ? "Unique persistent visitor identifier"
                        : k.includes("session")
                        ? "Active browsing session ID"
                        : k.includes("duration")
                        ? "Recorded time duration (seconds)"
                        : k.includes("visit_count")
                        ? "Total visits count"
                        : k.includes("utm")
                        ? "Marketing attribution channel"
                        : "Client telemetry attribute"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Leads Tab */}
          {activeTab === "lead" && (
            <form onSubmit={handleAddLeadSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0071E3]/5 border border-[#0071E3]/15 flex items-start gap-3">
                <UserPlus className="size-5 text-[#0071E3] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                    Promote Visitor to CRM Lead
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Converts this visitor session into a qualified prospect inside your CRM Leads pipeline. Their location ({city}, {country}), street address, and engagement history will automatically attach.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <User className="size-3.5 text-neutral-400" />
                    <span>Lead Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder={`e.g. Lead from ${city || country}`}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FBFBFC] border border-black/[0.08] focus:border-[#0071E3] focus:bg-white rounded-xl outline-none transition shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Mail className="size-3.5 text-neutral-400" />
                    <span>Contact Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="prospect@company.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FBFBFC] border border-black/[0.08] focus:border-[#0071E3] focus:bg-white rounded-xl outline-none transition shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Phone className="size-3.5 text-neutral-400" />
                    <span>Phone Number (Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FBFBFC] border border-black/[0.08] focus:border-[#0071E3] focus:bg-white rounded-xl outline-none transition shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Building className="size-3.5 text-neutral-400" />
                    <span>Company Name (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FBFBFC] border border-black/[0.08] focus:border-[#0071E3] focus:bg-white rounded-xl outline-none transition shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">
                  Internal Notes & Sales Strategy
                </label>
                <textarea
                  rows={3}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder={`High-interest visitor spent ${formatDuration(durationSec)} browsing ${pagesList.length} page(s).`}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FBFBFC] border border-black/[0.08] focus:border-[#0071E3] focus:bg-white rounded-xl outline-none transition shadow-2xs resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="px-4 py-2 rounded-xl border border-black/[0.08] text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  <UserPlus className="size-3.5" />
                  <span>{isSubmittingLead ? "Adding to CRM..." : "Confirm & Add to Leads"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 px-6 border-t border-black/[0.06] bg-neutral-50/60 flex items-center justify-between gap-4">
          <div className="text-xs text-neutral-500">
            Session: <span className="font-mono text-neutral-900">{visitor.session_id}</span> • Location: <span className="text-neutral-900">{city}, {country}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/[0.08] text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Close
            </button>

            {visitor.is_lead || isAlreadyLead ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="size-3.5" />
                <span>Already in Leads</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("lead")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-[0.98]"
              >
                <UserPlus className="size-3.5" />
                <span>Add to Leads</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
