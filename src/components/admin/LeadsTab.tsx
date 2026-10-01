import { useState } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  Building,
  MapPin,
  BookOpen,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  Flame,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Lead } from "@/types/crm";
import { CountryFlag } from "./CountryFlag";

interface LeadsTabProps {
  leads: Lead[];
  onCreateLead: (lead: Partial<Lead>) => Promise<void>;
  onUpdateStatus: (id: number, status: string) => Promise<void>;
  onUpdateNotes: (id: number, notes: string) => Promise<void>;
  onDeleteLead: (id: number) => Promise<void>;
}

export function LeadsTab({
  leads,
  onCreateLead,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteLead,
}: LeadsTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  // New Lead Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newSource, setNewSource] = useState("website_contact");
  const [newNotes, setNewNotes] = useState("");
  const [newCountry] = useState("United States");
  const [newCity, setNewCity] = useState("San Francisco");
  const [newScore] = useState(75);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Notes Modal State
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editNotesText, setEditNotesText] = useState("");

  // Filtering
  const filteredLeads = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.company && l.company.toLowerCase().includes(q)) ||
      (l.city && l.city.toLowerCase().includes(q)) ||
      (l.country && l.country.toLowerCase().includes(q)) ||
      (l.notes && l.notes.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (sourceFilter !== "all" && l.source !== sourceFilter) return false;

    return true;
  });

  // Calculate Metrics
  const totalCount = leads.length;
  const newCount = leads.filter((l) => l.status === "new").length;
  const blogReaderCount = leads.filter((l) => l.source === "blog_reader").length;
  const qualifiedCount = leads.filter((l) => l.status === "qualified" || l.status === "won").length;
  const avgScore =
    totalCount > 0
      ? Math.round(leads.reduce((acc, l) => acc + (l.score || 50), 0) / totalCount)
      : 70;

  // Format Duration
  const formatDuration = (seconds?: number) => {
    const s = seconds || 120;
    if (s < 60) return `${s}s`;
    const mins = Math.floor(s / 60);
    const remSecs = s % 60;
    return `${mins}m ${remSecs}s`;
  };

  // Status Badge Styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "contacted":
        return "bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/20";
      case "qualified":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "proposal":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "won":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
      default:
        return "bg-neutral-100 text-neutral-600 border-black/10";
    }
  };

  // Source Badge Styling
  const getSourceBadge = (source: string) => {
    switch (source) {
      case "blog_reader":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <BookOpen className="size-2.5" />
            Blog Reader
          </span>
        );
      case "website_contact":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20">
            <Mail className="size-2.5" />
            Website Contact
          </span>
        );
      case "visitor_promotion":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="size-2.5" />
            Promoted Visitor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-600 border border-black/10">
            Direct Lead
          </span>
        );
    }
  };

  // Export Leads to CSV
  const handleExportCsv = () => {
    if (leads.length === 0) {
      toast.error("No leads to export.");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Company",
      "Source",
      "Status",
      "Score",
      "Country",
      "City",
      "Postal Code",
      "Street",
      "Pages Viewed",
      "Duration (s)",
      "Notes",
      "Created At",
    ];

    const rows = leads.map((l) => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      l.source,
      l.status,
      l.score || 50,
      `"${(l.country || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.postal_code || '').replace(/"/g, '""')}"`,
      `"${(l.street || '').replace(/"/g, '""')}"`,
      l.pages_viewed_count || 1,
      l.duration_seconds || 0,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      l.created_at || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `codex_crm_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Leads exported to CSV successfully!");
  };

  // Handle Create Lead Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) {
      toast.error("Name and Email are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreateLead({
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        company: newCompany.trim(),
        source: newSource,
        status: "new",
        score: Number(newScore) || 75,
        notes: newNotes.trim(),
        country: newCountry,
        city: newCity,
        pages_viewed_count: 2,
        duration_seconds: 180,
      });

      toast.success("New lead created successfully!");
      setIsCreateModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewCompany("");
      setNewNotes("");
    } catch {
      toast.error("Failed to create lead.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Notes Submit
  const handleSaveNotes = async () => {
    if (!editingLead) return;
    try {
      await onUpdateNotes(editingLead.id, editNotesText);
      toast.success("Notes updated successfully.");
      setEditingLead(null);
    } catch {
      toast.error("Failed to update notes.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Key Metrics */}
      <div className="rounded-2xl bg-white border border-black/[0.06] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#0071E3]/10 text-[#0071E3]">
                <Users className="size-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                  Qualified CRM Leads & Contact Database
                </h2>
                <p className="text-xs text-neutral-500">
                  Prospects collected from visitor promotions, contact forms, and engaged blog readers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/[0.08] hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-all cursor-pointer shadow-2xs"
            >
              <Download className="size-3.5 text-neutral-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-all shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-black/[0.05] shadow-2xs">
            <span className="text-[11px] text-neutral-500 uppercase font-semibold">Total Leads</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-neutral-900">{totalCount}</span>
              <span className="text-[11px] text-emerald-600 font-medium">{newCount} new</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-black/[0.05] shadow-2xs">
            <span className="text-[11px] text-neutral-500 uppercase font-semibold">Blog Readers</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-rose-600">{blogReaderCount}</span>
              <span className="text-[11px] text-neutral-500">Content Inbound</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-black/[0.05] shadow-2xs">
            <span className="text-[11px] text-neutral-500 uppercase font-semibold">Qualified Pipeline</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-purple-600">{qualifiedCount}</span>
              <span className="text-[11px] text-neutral-500">High Value</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-black/[0.05] shadow-2xs">
            <span className="text-[11px] text-neutral-500 uppercase font-semibold">Avg Intent Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-emerald-600">{avgScore} / 100</span>
              <Flame className="size-3.5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="rounded-2xl bg-white border border-black/[0.06] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)]">
        {/* Search & Filters */}
        <div className="p-4 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F9F9FB]">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, company, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-black/[0.08] focus:border-[#0071E3] rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 transition-all outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Filter className="size-3 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-black/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-neutral-700 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="won">Won</option>
              </select>
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-white border border-black/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-neutral-700 outline-none cursor-pointer"
              >
                <option value="all">All Sources</option>
                <option value="blog_reader">Blog Readers</option>
                <option value="website_contact">Website Contacts</option>
                <option value="visitor_promotion">Promoted Visitors</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-neutral-500">
            Showing <strong className="text-neutral-900">{filteredLeads.length}</strong> of {leads.length} leads
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-900">
            <thead className="bg-[#F9F9FB] text-neutral-500 text-[11px] uppercase font-semibold tracking-wider border-b border-black/[0.06]">
              <tr>
                <th className="py-3 px-4 font-medium">Lead Name & Company</th>
                <th className="py-3 px-4 font-medium">Contact Details</th>
                <th className="py-3 px-4 font-medium">Source Channel</th>
                <th className="py-3 px-4 font-medium">Location & Address</th>
                <th className="py-3 px-4 font-medium">Engagement & Intent</th>
                <th className="py-3 px-4 font-medium">Pipeline Status</th>
                <th className="py-3 px-4 font-medium">Notes</th>
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-neutral-400">
                    <Users className="size-8 mx-auto text-neutral-300 mb-2" />
                    <p className="font-semibold text-neutral-800">No leads found</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Promote visitors from the Visitor Stream or capture inquiries from contact forms and blog readers.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-[#FBFBFC] transition-colors">
                    {/* Name & Company */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold text-neutral-900 text-xs flex items-center gap-1.5">
                          <span>{l.name}</span>
                          {l.score && l.score >= 85 ? (
                            <span className="p-0.5 text-amber-500" title="High Intent Lead">
                              <Flame className="size-3" />
                            </span>
                          ) : null}
                        </div>
                        {l.company ? (
                          <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                            <Building className="size-3 text-neutral-400" />
                            <span>{l.company}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-neutral-400">Private Individual</span>
                        )}
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        {l.email ? (
                          <a
                            href={`mailto:${l.email}`}
                            className="text-xs text-[#0071E3] hover:underline font-mono flex items-center gap-1"
                            title="Send email"
                          >
                            <Mail className="size-3 text-[#0071E3]" />
                            <span>{l.email}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-neutral-400">No email</span>
                        )}

                        {l.phone ? (
                          <a
                            href={`tel:${l.phone}`}
                            className="text-[11px] text-neutral-500 hover:text-neutral-900 font-mono flex items-center gap-1"
                          >
                            <Phone className="size-3 text-neutral-400" />
                            <span>{l.phone}</span>
                          </a>
                        ) : null}
                      </div>
                    </td>

                    {/* Source Channel */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getSourceBadge(l.source)}
                    </td>

                    {/* Location with Flag */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-2 font-medium text-neutral-900">
                          <CountryFlag country={l.country} flag={l.flag} size="sm" />
                          <span>{l.country || "Global"}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="size-2.5 text-neutral-400" />
                          <span>{l.street || l.city || "Corporate HQ"}</span>
                          {l.postal_code ? <span className="font-mono text-[10px]">({l.postal_code})</span> : null}
                        </div>
                      </div>
                    </td>

                    {/* Engagement & Intent */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-neutral-900">
                            {l.score || 70}/100
                          </span>
                          <span className="text-[10px] text-neutral-400">score</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                          <span>{l.pages_viewed_count || 1} pages</span>
                          <span>•</span>
                          <span>{formatDuration(l.duration_seconds)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Pipeline Status Selector */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={l.status}
                        onChange={(e) => onUpdateStatus(l.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border outline-none cursor-pointer transition-colors ${getStatusBadge(
                          l.status
                        )}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal">Proposal</option>
                        <option value="won">Won</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 group/note">
                        <p className="text-xs text-neutral-600 truncate" title={l.notes}>
                          {l.notes || "No notes attached"}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLead(l);
                            setEditNotesText(l.notes || "");
                          }}
                          className="opacity-0 group-hover/note:opacity-100 p-1 text-neutral-400 hover:text-neutral-700 transition-opacity cursor-pointer"
                          title="Edit notes"
                        >
                          <Edit3 className="size-3" />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {l.email ? (
                          <a
                            href={`mailto:${l.email}`}
                            className="p-1.5 rounded-lg text-[#0071E3] hover:bg-[#0071E3]/10 transition-colors"
                            title="Send Email"
                          >
                            <Mail className="size-3.5" />
                          </a>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => {
                            setEditingLead(l);
                            setEditNotesText(l.notes || "");
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Edit Notes"
                        >
                          <Edit3 className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove lead "${l.name}"?`)) {
                              void onDeleteLead(l.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-black/[0.08] p-5 sm:p-6 overflow-hidden flex flex-col max-h-[92dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] shrink-0">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <Plus className="size-4 text-[#0071E3]" />
                <span>Add Lead to CRM</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 overflow-y-auto flex-1 py-3 pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 text-xs bg-[#FBFBFC] border border-black/[0.08] rounded-xl focus:border-[#0071E3] focus:bg-white outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full px-3 py-2 text-xs bg-[#FBFBFC] border border-black/[0.08] rounded-xl focus:border-[#0071E3] focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Phone Number</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs bg-[#FBFBFC] border border-black/[0.08] rounded-xl focus:border-[#0071E3] focus:bg-white outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Company</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Acme Systems"
                    className="w-full px-3 py-2 text-xs bg-[#FBFBFC] border border-black/[0.08] rounded-xl focus:border-[#0071E3] focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">Source Channel</label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FBFBFC] border border-black/[0.08] rounded-xl focus:border-[#0071E3] focus:bg-white outline-none transition cursor-pointer"
                  >
                    <option value="website_contact">Website Contact Form</option>
                    <option value="blog_reader">Blog Reader Subscription</option>
                    <option value="visitor_promotion">Visitor Promotion</option>
                    <option value="direct_referral">Direct Referral</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">City & Country</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="City, Country"
                    className="w-full px-3 py-2 text-xs bg-[#FBFBFC] border border-black/[0.08] rounded-xl focus:border-[#0071E3] focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700">Strategic Notes</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Key requirements, budget, timeline, or notes..."
                  className="w-full px-3 py-2 text-xs bg-[#FBFBFC] border border-black/[0.08] rounded-xl focus:border-[#0071E3] focus:bg-white outline-none resize-none transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-black/[0.08] text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4.5 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notes Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-black/[0.08] p-5 sm:p-6 overflow-hidden flex flex-col max-h-[92dvh] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] shrink-0">
              <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <Edit3 className="size-4 text-[#0071E3]" />
                <span>Notes for {editingLead.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              <textarea
                rows={5}
                value={editNotesText}
                onChange={(e) => setEditNotesText(e.target.value)}
                placeholder="Enter notes about requirements, calls, proposals..."
                className="w-full p-3 text-xs bg-[#FBFBFC] border border-black/[0.08] rounded-xl focus:border-[#0071E3] focus:bg-white outline-none resize-none transition"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 rounded-xl border border-black/[0.08] text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-4.5 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
