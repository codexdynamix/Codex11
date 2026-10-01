import React, { useState } from "react";
import { Link2, Plus, ExternalLink, Trash2, Edit3, X, Check } from "lucide-react";
import { toast } from "sonner";
import type { Backlink } from "@/types/crm";

interface BacklinksTabProps {
  backlinks: Backlink[];
  onAddBacklink: (data: { name: string; url: string; notes: string }) => Promise<boolean>;
  onEditBacklink?: (id: number, data: { name: string; url: string; notes: string }) => Promise<boolean>;
  onDeleteBacklink: (id: number) => Promise<boolean>;
}

export function BacklinksTab({
  backlinks,
  onAddBacklink,
  onEditBacklink,
  onDeleteBacklink,
}: BacklinksTabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBacklink, setEditingBacklink] = useState<Backlink | null>(null);

  const [form, setForm] = useState({ name: "", url: "", notes: "" });
  const [editForm, setEditForm] = useState({ name: "", url: "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.url) return;
    const ok = await onAddBacklink(form);
    if (ok) {
      setForm({ name: "", url: "", notes: "" });
      setIsOpen(false);
      toast.success("SEO backlink saved to SQLite database.");
    }
  };

  const handleStartEdit = (b: Backlink) => {
    setEditingBacklink(b);
    setEditForm({
      name: b.name || "",
      url: b.url || "",
      notes: b.notes || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBacklink || !editForm.name || !editForm.url) return;
    if (onEditBacklink) {
      const ok = await onEditBacklink(editingBacklink.id, editForm);
      if (ok) {
        setEditingBacklink(null);
        toast.success("Backlink updated in SQLite.");
      }
    } else {
      toast.error("Edit handler not configured.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Unified Apple-Style Container */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header Section */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center border border-[#0071E3]/15 shadow-2xs">
                <Link2 className="size-4" />
              </div>
              <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                SEO Backlinks & Referring Domains
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Referring domains, guest posts, media coverage, and indexation status to monitor domain authority.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              setEditingBacklink(null);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-medium transition-all shadow-2xs active:scale-[0.99] cursor-pointer shrink-0"
          >
            <Plus className="size-3.5" />
            <span>{isOpen ? "Close Form" : "Add Backlink"}</span>
          </button>
        </div>

        {/* Add Backlink Inline Panel */}
        {isOpen && (
          <div className="border-t border-b border-black/[0.06] bg-[#FBFBFC] p-5 sm:p-6">
            <h3 className="text-xs font-semibold text-neutral-900 mb-3">
              Register New Referring Source
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                  Publisher / Platform Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Forbes Tech / GitHub / ProductHunt"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white border border-black/[0.08] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                  Target Live URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/article"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full bg-white border border-black/[0.08] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition font-mono shadow-2xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                  Anchor Text & SEO Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. DoFollow link on 'Custom Engineering', DA: 82"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-white border border-black/[0.08] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/15 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition shadow-2xs"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-black/[0.08] hover:bg-neutral-100 text-neutral-600 text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition cursor-pointer shadow-xs"
                >
                  Save Backlink
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Backlinks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-800 border-collapse">
            <thead className="bg-neutral-50/70 text-neutral-400 text-[10px] uppercase font-semibold font-mono tracking-wider border-t border-b border-black/[0.05]">
              <tr>
                <th className="py-3 px-4 font-semibold">Publisher / Source</th>
                <th className="py-3 px-4 font-semibold">Live URL</th>
                <th className="py-3 px-4 font-semibold">Anchor Text & SEO Notes</th>
                <th className="py-3 px-4 font-semibold">Date Indexed</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {backlinks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    No backlinks registered yet. Click "Add Backlink" to record one.
                  </td>
                </tr>
              ) : (
                backlinks.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      <div className="flex items-center gap-2">
                        <Link2 className="size-3.5 text-[#0071E3] shrink-0" />
                        <span>{b.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-[#0071E3] hover:underline"
                      >
                        <span>{b.url.length > 40 ? b.url.slice(0, 40) + "..." : b.url}</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </td>

                    <td className="py-3 px-4 text-neutral-600">
                      {b.notes || "High authority referring domain"}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">
                      {b.created_at ? b.created_at.slice(0, 10) : "Active"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(b)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Edit backlink"
                        >
                          <Edit3 className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            await onDeleteBacklink(b.id);
                            toast.info("Backlink removed.");
                          }}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete backlink"
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

      {/* Edit Backlink Modal */}
      {editingBacklink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-black/[0.08] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <Edit3 className="size-4 text-[#0071E3]" />
                <h3 className="text-sm font-semibold text-neutral-900">
                  Edit Backlink #{editingBacklink.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBacklink(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                  Publisher / Source Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#F9F9FB] border border-black/[0.08] focus:border-[#0071E3] focus:bg-white rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                  Live URL
                </label>
                <input
                  type="url"
                  required
                  value={editForm.url}
                  onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                  className="w-full bg-[#F9F9FB] border border-black/[0.08] focus:border-[#0071E3] focus:bg-white rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none transition font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                  Anchor Text & SEO Notes
                </label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full bg-[#F9F9FB] border border-black/[0.08] focus:border-[#0071E3] focus:bg-white rounded-xl p-2.5 text-xs text-neutral-900 outline-none transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setEditingBacklink(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-black/[0.08] hover:bg-neutral-100 text-neutral-600 text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition shadow-2xs cursor-pointer"
                >
                  <Check className="size-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
