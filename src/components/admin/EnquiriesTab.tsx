import { useState } from "react";
import {
  Inbox,
  Mail,
  Phone,
  Clock,
  Trash2,
  Building,
  Download,
  FileSpreadsheet,
  FileJson,
  ChevronDown,
  CheckSquare,
  Square,
  MinusSquare,
  CheckCircle2,
  RefreshCw,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import type { Enquiry } from "@/types/crm";

interface EnquiriesTabProps {
  enquiries: Enquiry[];
  onUpdateStatus: (id: number, status: string) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
  onBulkDeleteEnquiries?: (ids: number[]) => Promise<boolean>;
}

export function EnquiriesTab({
  enquiries,
  onUpdateStatus,
  onDelete,
  onBulkDeleteEnquiries,
}: EnquiriesTabProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isExportOpen, setIsExportOpen] = useState(false);

  const filtered = enquiries.filter(
    (e) => statusFilter === "all" || e.status === statusFilter
  );

  const allFilteredIds = filtered.map((e) => e.id);
  const isAllSelected =
    allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id));
  const isSomeSelected =
    selectedIds.size > 0 && (!isAllSelected || selectedIds.size < allFilteredIds.length);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allFilteredIds));
    }
  };

  const toggleSelectOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${count} selected inquiry(ies)?`)) return;

    if (onBulkDeleteEnquiries) {
      const ok = await onBulkDeleteEnquiries(Array.from(selectedIds));
      if (ok) {
        toast.success(`Deleted ${count} inquiry(ies).`);
        setSelectedIds(new Set());
      }
    } else {
      toast.error("Bulk delete handler not configured.");
    }
  };

  const handleBulkUpdateStatus = async (status: string) => {
    const count = selectedIds.size;
    if (count === 0) return;
    for (const id of Array.from(selectedIds)) {
      await onUpdateStatus(id, status);
    }
    toast.success(`Updated ${count} inquiry(ies) to "${status}".`);
    setSelectedIds(new Set());
  };

  const handleDownloadCsv = (
    items = selectedIds.size > 0
      ? filtered.filter((e) => selectedIds.has(e.id))
      : filtered
  ) => {
    if (items.length === 0) {
      toast.error("No inquiries to download.");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Company",
      "Status",
      "Message",
      "Created At",
    ];
    const rows = items.map((e) => [
      e.id,
      `"${(e.name || "").replace(/"/g, '""')}"`,
      `"${(e.email || "").replace(/"/g, '""')}"`,
      `"${(e.phone || "").replace(/"/g, '""')}"`,
      `"${(e.company || "").replace(/"/g, '""')}"`,
      `"${(e.status || "").replace(/"/g, '""')}"`,
      `"${(e.message || "").replace(/"/g, '""')}"`,
      `"${(e.created_at || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `codex_inquiries_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success(`Exported ${items.length} inquiry(ies) to CSV.`);
  };

  const handleExportJson = (
    items = selectedIds.size > 0
      ? filtered.filter((e) => selectedIds.has(e.id))
      : filtered
  ) => {
    if (items.length === 0) {
      toast.error("No inquiries to export.");
      return;
    }
    const jsonStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(items, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonStr);
    link.setAttribute(
      "download",
      `codex_inquiries_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success(`Exported ${items.length} inquiry(ies) to JSON.`);
  };

  const getInitials = (name: string) => {
    return (name || "")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "IN";
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-neutral-900 text-white rounded-2xl p-3 px-4.5 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 border border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center size-5 rounded-lg bg-white/20 text-xs font-semibold font-mono">
              {selectedIds.size}
            </span>
            <span className="text-xs font-medium text-neutral-200">
              {selectedIds.size} inquiry{selectedIds.size > 1 ? "ies" : ""} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadCsv()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition cursor-pointer"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportJson()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition cursor-pointer"
            >
              <FileJson className="size-3.5 text-amber-400" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkUpdateStatus("contacted")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition cursor-pointer"
            >
              <CheckCircle2 className="size-3 text-[#0071E3]" />
              <span>Mark Contacted</span>
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Delete Selected</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Single Unified Apple-Style Container */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header Section */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#0071E3]/10 text-[#0071E3]">
                <Inbox className="size-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                  Inquiries & Contact Submissions
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Direct form inquiries from prospects interested in custom software and web development.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/[0.08] bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition cursor-pointer shadow-2xs"
              >
                <Download className="size-3.5 text-neutral-500" />
                <span>Export</span>
                <ChevronDown className="size-3 text-neutral-400" />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-1.5 w-52 rounded-2xl bg-white border border-black/[0.08] shadow-xl p-1.5 z-30 space-y-1 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => handleDownloadCsv()}
                    className="w-full text-left px-3 py-2 text-xs text-neutral-800 hover:bg-neutral-50 rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="size-4 text-emerald-600" />
                    <div>
                      <div className="font-medium">Download as CSV</div>
                      <div className="text-[10px] text-neutral-400">Spreadsheet table format</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportJson()}
                    className="w-full text-left px-3 py-2 text-xs text-neutral-800 hover:bg-neutral-50 rounded-xl transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <FileJson className="size-4 text-amber-600" />
                    <div>
                      <div className="font-medium">Export as JSON</div>
                      <div className="text-[10px] text-neutral-400">Raw JSON dataset</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="size-3 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter enquiries by status"
                className="bg-white border border-black/[0.08] rounded-xl px-2.5 py-1.5 text-xs font-medium text-neutral-700 focus:border-[#0071E3] outline-none cursor-pointer"
              >
                <option value="all">All ({enquiries.length})</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* List Sub-header with Select All */}
        <div className="border-t border-b border-black/[0.06] bg-[#F9F9FB] px-4 py-2.5 flex items-center justify-between text-xs text-neutral-500">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-medium text-neutral-700 hover:text-[#0071E3] transition cursor-pointer"
          >
            {isAllSelected ? (
              <CheckSquare className="size-4 text-[#0071E3]" />
            ) : isSomeSelected ? (
              <MinusSquare className="size-4 text-[#0071E3]" />
            ) : (
              <Square className="size-4 text-neutral-400" />
            )}
            <span>Select All ({filtered.length})</span>
          </button>
          <span className="text-neutral-400 font-mono text-[11px]">
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${filtered.length} total`}
          </span>
        </div>

        {/* Grouped Inquiries List */}
        <div className="divide-y divide-black/[0.04]">
          {filtered.length === 0 ? (
            <div className="p-14 text-center text-xs text-neutral-500">
              <div className="size-9 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-2">
                <RefreshCw className="size-4 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-neutral-800">No inquiries found</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Client messages submitted through the website contact form will appear here in real time.
              </p>
            </div>
          ) : (
            filtered.map((lead) => {
              const isSelected = selectedIds.has(lead.id);

              return (
                <div
                  key={lead.id}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors ${
                    isSelected ? "bg-[#0071E3]/5" : "hover:bg-neutral-50/70"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(lead.id)}
                      className="mt-1 text-neutral-400 hover:text-neutral-700 transition cursor-pointer shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="size-4 text-[#0071E3]" />
                      ) : (
                        <Square className="size-4" />
                      )}
                    </button>

                    {/* Avatar Squircle */}
                    <div className="size-9 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center text-xs font-semibold shrink-0 border border-black/[0.06]">
                      {getInitials(lead.name)}
                    </div>

                    <div className="space-y-2.5 flex-1 min-w-0">
                      {/* Name, Company & Status */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-sm text-neutral-900">
                          {lead.name}
                        </h3>
                        {lead.company && (
                          <span className="inline-flex items-center gap-1 text-xs text-neutral-500 font-medium">
                            <Building className="size-3 text-neutral-400" />
                            {lead.company}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider ${
                            lead.status === "new"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : lead.status === "contacted"
                              ? "bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>

                      {/* Contact metadata */}
                      <div className="flex flex-wrap items-center gap-3.5 text-xs">
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1 text-[#0071E3] hover:underline font-medium font-mono"
                          >
                            <Mail className="size-3" />
                            {lead.email}
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900 font-medium font-mono"
                          >
                            <Phone className="size-3 text-neutral-400" />
                            {lead.phone}
                          </a>
                        )}
                        <span className="inline-flex items-center gap-1 text-neutral-400 font-mono text-[11px]">
                          <Clock className="size-3" />
                          {lead.created_at || "Recent"}
                        </span>
                      </div>

                      {/* Message Content Bubble - Apple Notes style */}
                      <div className="p-3 bg-[#FBFBFC] border border-black/[0.04] rounded-xl text-xs text-neutral-700 leading-relaxed break-words shadow-2xs">
                        "{lead.message}"
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 self-end sm:self-auto">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          const nextStatus = lead.status === "new" ? "contacted" : "closed";
                          await onUpdateStatus(lead.id, nextStatus);
                          toast.success(`Lead marked as ${nextStatus}.`);
                        }}
                        className="px-3 py-1.5 bg-neutral-100/80 hover:bg-neutral-200/70 text-neutral-800 rounded-xl text-xs font-medium border border-black/[0.06] transition cursor-pointer"
                      >
                        {lead.status === "new" ? "Mark Contacted" : "Mark Closed"}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete inquiry from "${lead.name}"?`)) return;
                          await onDelete(lead.id);
                          toast.info("Inquiry deleted from database.");
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
