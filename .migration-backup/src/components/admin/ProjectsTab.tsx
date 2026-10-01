import React, { useState, useMemo, useRef } from "react";
import {
  Briefcase,
  Plus,
  ExternalLink,
  Trash2,
  Edit3,
  X,
  Check,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Tag,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/crm";
import { ImagePickerModal } from "@/components/admin/ImagePickerModal";

interface ProjectsTabProps {
  projects: Project[];
  onSaveProject: (data: any) => Promise<boolean>;
  onEditProject?: (id: number, data: any) => Promise<boolean>;
  onToggleProject: (id: number, is_published: boolean) => Promise<boolean>;
  onDeleteProject: (id: number) => Promise<boolean>;
}

const DEFAULT_CATEGORIES = [
  "Websites & Web Apps",
  "CRMs & Calling Systems",
  "Graphic Design & Branding",
  "Meta & Google Ads",
  "Email Marketing",
  "Web Engineering",
  "Full-Stack SaaS",
  "Mobile App",
  "Creative Production",
  "Branding & Identity",
  "E-Commerce & Storefronts",
  "AI Solutions & Automation",
];

export function ProjectsTab({
  projects,
  onSaveProject,
  onEditProject,
  onToggleProject,
  onDeleteProject,
}: ProjectsTabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Modal and Upload State
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"add" | "edit">("add");
  const [isUploading, setIsUploading] = useState(false);
  const [showDirectUrlInput, setShowDirectUrlInput] = useState(false);
  const [showEditDirectUrlInput, setShowEditDirectUrlInput] = useState(false);

  // File input references
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Custom Category State for Add
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // Custom Category State for Edit
  const [isEditCustomCategory, setIsEditCustomCategory] = useState(false);
  const [editCustomCategoryInput, setEditCustomCategoryInput] = useState("");

  // Add Form State
  const [form, setForm] = useState({
    title: "",
    site_name: "",
    site_url: "",
    description: "",
    category: "Websites & Web Apps",
    image_url: "",
    is_published: true,
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    title: "",
    site_name: "",
    site_url: "",
    description: "",
    category: "Websites & Web Apps",
    image_url: "",
    is_published: true,
  });

  // Dynamic available categories including any previously custom-added categories from projects
  const availableCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    for (const p of projects) {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    }
    return Array.from(set);
  }, [projects]);

  // Handle direct file upload to server
  const handleFileUpload = async (file: File, target: "add" | "edit") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file (JPEG, PNG, WebP, SVG, GIF).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large (max 10MB).");
      return;
    }

    const toastId = toast.loading(`Uploading picture "${file.name}"...`);
    setIsUploading(true);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/crm/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upload_image",
          name: file.name,
          data: base64Data,
        }),
      });

      const data = await res.json();
      if (data.ok && data.url) {
        if (target === "add") {
          setForm((prev) => ({ ...prev, image_url: data.url }));
        } else {
          setEditForm((prev) => ({ ...prev, image_url: data.url }));
        }
        toast.success("Picture uploaded successfully!", { id: toastId });
      } else {
        toast.error(data.error || "Upload failed. Please try again.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to process image.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.site_url.trim()) {
      toast.error("Project Title and Production URL are required.");
      return;
    }

    const finalCategory = isCustomCategory
      ? customCategoryInput.trim() || "Custom Project"
      : form.category;

    const payload = {
      ...form,
      category: finalCategory,
    };

    const ok = await onSaveProject(payload);
    if (ok) {
      setForm({
        title: "",
        site_name: "",
        site_url: "",
        description: "",
        category: "Websites & Web Apps",
        image_url: "",
        is_published: true,
      });
      setIsCustomCategory(false);
      setCustomCategoryInput("");
      setShowDirectUrlInput(false);
      setIsOpen(false);
      toast.success("Project added to portfolio showcase with picture and category.");
    }
  };

  const handleStartEdit = (p: Project) => {
    setEditingProject(p);
    const isCustom = p.category ? !DEFAULT_CATEGORIES.includes(p.category) : false;
    setIsEditCustomCategory(isCustom);
    setEditCustomCategoryInput(isCustom ? p.category : "");
    setShowEditDirectUrlInput(false);

    setEditForm({
      title: p.title || "",
      site_name: p.site_name || "",
      site_url: p.site_url || "",
      description: p.description || "",
      category: p.category || "Websites & Web Apps",
      image_url: p.image_url || "",
      is_published: Boolean(p.is_published),
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editForm.title.trim() || !editForm.site_url.trim()) return;

    const finalCategory = isEditCustomCategory
      ? editCustomCategoryInput.trim() || "Custom Project"
      : editForm.category;

    const payload = {
      ...editForm,
      category: finalCategory,
    };

    if (onEditProject) {
      const ok = await onEditProject(editingProject.id, payload);
      if (ok) {
        setEditingProject(null);
        toast.success("Project updated successfully.");
      }
    } else {
      toast.error("Edit handler not configured.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs for uploading pictures */}
      <input
        ref={addFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileUpload(e.target.files[0], "add");
            e.target.value = "";
          }
        }}
      />
      <input
        ref={editFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileUpload(e.target.files[0], "edit");
            e.target.value = "";
          }
        }}
      />

      {/* Reusable Image Picker Modal */}
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        currentValue={pickerTarget === "add" ? form.image_url : editForm.image_url}
        onSelect={(url) => {
          if (pickerTarget === "add") {
            setForm((prev) => ({ ...prev, image_url: url }));
          } else {
            setEditForm((prev) => ({ ...prev, image_url: url }));
          }
          toast.success("Picture selected for project.");
        }}
        title="Choose Project Showcase Picture"
        showMetaOptions={false}
      />

      {/* Header Banner */}
      <div className="surface-lift rounded-2xl bg-card border border-black/8 p-5 sm:p-6 shadow-[0_0_0_1px_rgb(0_0_0_/_0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="size-5 text-blue" />
            <h2 className="text-base font-semibold text-label font-display tracking-tight">
              Completed Projects & Client Works Showcase
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Publish client site links, live deliverables, high-res project pictures, and custom categories. Visitors on the public site will see these in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setEditingProject(null);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-label hover:bg-black text-paper text-xs font-medium transition-all shadow-sm active:scale-[0.99] cursor-pointer shrink-0"
        >
          <Plus className="size-3.5" />
          <span>{isOpen ? "Close Form" : "Post Project"}</span>
        </button>
      </div>

      {/* Add Project Form */}
      {isOpen && (
        <div className="surface-lift rounded-3xl bg-card border border-blue/30 p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-blue" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                Post Completed Client Project
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Images & custom categories reflect instantly on visitor portfolio
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1.5">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Luxury Chrono & Automotive Platform"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-label outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1.5">
                  Client / Brand Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Motor Cars GmbH"
                  value={form.site_name}
                  onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                  className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-label outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1.5">
                  Production URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={form.site_url}
                  onChange={(e) => setForm({ ...form, site_url: e.target.value })}
                  className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-label outline-none transition-all font-mono"
                />
              </div>

              {/* Category with Custom Category Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-subtle flex items-center gap-1.5">
                    <Tag className="size-3 text-blue" />
                    <span>Category</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isCustomCategory) {
                        setIsCustomCategory(true);
                        setCustomCategoryInput(form.category || "");
                      } else {
                        setIsCustomCategory(false);
                      }
                    }}
                    className="text-[11px] font-medium text-blue hover:text-blue-hover underline cursor-pointer"
                  >
                    {isCustomCategory ? "← Choose Preset" : "+ Add Custom Category"}
                  </button>
                </div>

                {isCustomCategory ? (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Enter custom category (e.g. AI Automation & VoIP Desk)"
                        value={customCategoryInput}
                        onChange={(e) => {
                          setCustomCategoryInput(e.target.value);
                          setForm({ ...form, category: e.target.value });
                        }}
                        className="w-full bg-blue/5 border border-blue/40 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-label outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(false)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle hover:text-label p-1 text-[11px]"
                        title="Back to dropdown"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">Quick Suggestions:</span>
                      {["AI Automation", "VoIP Telephony", "Fintech & Web3", "Hospitality Platform"].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            setCustomCategoryInput(sug);
                            setForm({ ...form, category: sug });
                          }}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-fill hover:bg-blue/10 hover:text-blue border border-black/8 transition cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <select
                    value={form.category}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomCategory(true);
                        setCustomCategoryInput("");
                      } else {
                        setForm({ ...form, category: e.target.value });
                      }
                    }}
                    className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-label outline-none transition-all cursor-pointer"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__custom__" className="text-blue font-semibold">
                      + Add Custom Category...
                    </option>
                  </select>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1.5">
                Description & Architectural Scope
              </label>
              <textarea
                rows={3}
                placeholder="Key technical achievements, stack used, deliverable metrics, and live impact..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl p-3 text-xs text-label outline-none transition-all"
              />
            </div>

            {/* Picture Upload & Preset Selector Section */}
            <div className="rounded-2xl border border-black/8 bg-fill/30 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-4 text-blue" />
                  <span className="text-xs font-semibold text-label">
                    Project Picture & Visual Showcase
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPickerTarget("add");
                      setIsImagePickerOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-fill text-label border border-black/10 text-[11px] font-medium transition shadow-xs cursor-pointer"
                  >
                    <Sparkles className="size-3 text-blue" />
                    <span>Presets & Library</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDirectUrlInput(!showDirectUrlInput)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-subtle hover:text-label hover:bg-fill text-[11px] font-medium transition cursor-pointer"
                  >
                    <LinkIcon className="size-3" />
                    <span>{showDirectUrlInput ? "Hide URL" : "Paste URL"}</span>
                  </button>
                </div>
              </div>

              {/* Direct file dropzone & upload button */}
              {form.image_url ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-3 rounded-xl border border-black/8 shadow-xs">
                  <div className="relative w-full sm:w-44 h-28 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-black/10 group">
                    <img
                      src={form.image_url}
                      alt="Project Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Picture Attached
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate font-mono">
                        {form.image_url}
                      </span>
                    </div>
                    <p className="text-[11px] text-subtle">
                      This picture will be featured as the primary card preview in the public portfolio grid.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => addFileInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-fill hover:bg-fill-elevated text-label text-xs font-medium border border-black/8 transition cursor-pointer"
                      >
                        {isUploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                        <span>Upload New</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPickerTarget("add");
                          setIsImagePickerOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-fill hover:bg-fill-elevated text-label text-xs font-medium border border-black/8 transition cursor-pointer"
                      >
                        <Sparkles className="size-3 text-blue" />
                        <span>Change Preset</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: "" })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-red-600 hover:bg-red-50 text-xs font-medium transition cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handleFileUpload(e.dataTransfer.files[0], "add");
                    }
                  }}
                  className="border-2 border-dashed border-black/15 hover:border-blue/50 rounded-2xl p-6 text-center transition-all bg-white/60 hover:bg-white flex flex-col items-center justify-center gap-2 cursor-pointer"
                  onClick={() => addFileInputRef.current?.click()}
                >
                  <div className="size-10 rounded-full bg-blue/10 flex items-center justify-center text-blue mb-1">
                    {isUploading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Upload className="size-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-label hover:underline">
                      Click to upload project picture
                    </span>
                    <span className="text-xs text-muted-foreground"> or drag and drop here</span>
                  </div>
                  <p className="text-[11px] text-subtle">
                    Supports high-resolution PNG, JPG, WebP, SVG screenshots (up to 10MB)
                  </p>
                </div>
              )}

              {/* Optional direct URL input if expanded */}
              {showDirectUrlInput && (
                <div className="pt-2">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-subtle mb-1">
                    Direct Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="/work/storefront.jpg or https://images.unsplash.com/..."
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full bg-white border border-black/10 focus:border-blue rounded-xl px-3.5 py-2 text-xs text-label outline-none font-mono transition"
                  />
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-hairline">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-label select-none">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="rounded text-blue focus:ring-blue size-4 border-black/15 cursor-pointer"
                />
                <span>Publish immediately to visitors on public site</span>
              </label>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-full border border-black/10 hover:bg-fill text-muted-foreground text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue hover:bg-blue-hover text-paper text-xs font-medium transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  <Check className="size-3.5" />
                  <span>Save Project to Portfolio</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="surface-lift w-full max-w-xl rounded-3xl bg-card border border-black/10 p-6 sm:p-8 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div className="flex items-center gap-2">
                <Edit3 className="size-4 text-blue" />
                <h3 className="text-sm font-semibold text-label">
                  Edit Portfolio Project #{editingProject.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-1.5 text-subtle hover:text-label rounded-full hover:bg-fill transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2 text-xs text-label outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
                    Client / Brand Name
                  </label>
                  <input
                    type="text"
                    value={editForm.site_name}
                    onChange={(e) => setEditForm({ ...editForm, site_name: e.target.value })}
                    className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2 text-xs text-label outline-none transition"
                  />
                </div>

                {/* Edit Category with Custom Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-subtle flex items-center gap-1">
                      <Tag className="size-3 text-blue" />
                      <span>Category</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isEditCustomCategory) {
                          setIsEditCustomCategory(true);
                          setEditCustomCategoryInput(editForm.category || "");
                        } else {
                          setIsEditCustomCategory(false);
                        }
                      }}
                      className="text-[11px] font-medium text-blue hover:text-blue-hover underline cursor-pointer"
                    >
                      {isEditCustomCategory ? "← Presets" : "+ Custom Category"}
                    </button>
                  </div>

                  {isEditCustomCategory ? (
                    <div className="relative">
                      <input
                        type="text"
                        autoFocus
                        placeholder="e.g. AI Automation & SaaS Desk"
                        value={editCustomCategoryInput}
                        onChange={(e) => {
                          setEditCustomCategoryInput(e.target.value);
                          setEditForm({ ...editForm, category: e.target.value });
                        }}
                        className="w-full bg-blue/5 border border-blue/40 focus:border-blue focus:bg-white rounded-xl px-3 py-2 text-xs text-label outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditCustomCategory(false)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle hover:text-label"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={editForm.category}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsEditCustomCategory(true);
                          setEditCustomCategoryInput("");
                        } else {
                          setEditForm({ ...editForm, category: e.target.value });
                        }
                      }}
                      className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3 py-2 text-xs text-label outline-none transition cursor-pointer"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__custom__" className="text-blue font-semibold">
                        + Add Custom Category...
                      </option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
                  Production URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={editForm.site_url}
                  onChange={(e) => setEditForm({ ...editForm, site_url: e.target.value })}
                  className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2 text-xs text-label outline-none transition font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl p-2.5 text-xs text-label outline-none transition"
                />
              </div>

              {/* Edit Image Section */}
              <div className="rounded-2xl border border-black/8 bg-fill/30 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-label flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-blue" />
                    <span>Project Picture</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-fill text-label border border-black/10 text-[11px] font-medium transition cursor-pointer"
                    >
                      {isUploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3 text-blue" />}
                      <span>Upload Picture</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPickerTarget("edit");
                        setIsImagePickerOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-fill text-label border border-black/10 text-[11px] font-medium transition cursor-pointer"
                    >
                      <Sparkles className="size-3 text-blue" />
                      <span>Presets</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditDirectUrlInput(!showEditDirectUrlInput)}
                      className="text-subtle hover:text-label text-[11px] p-1"
                    >
                      <LinkIcon className="size-3" />
                    </button>
                  </div>
                </div>

                {editForm.image_url ? (
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-black/8">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-black/10">
                      <img
                        src={editForm.image_url}
                        alt="Project"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-label truncate font-mono">
                        {editForm.image_url}
                      </p>
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, image_url: "" })}
                        className="text-[11px] text-red-600 hover:underline mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                        <span>Remove picture</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="border border-dashed border-black/15 hover:border-blue/50 rounded-xl p-3 text-center transition bg-white/60 hover:bg-white cursor-pointer"
                  >
                    <span className="text-xs text-subtle">
                      Click to upload a picture or select a preset
                    </span>
                  </div>
                )}

                {showEditDirectUrlInput && (
                  <input
                    type="text"
                    placeholder="/work/storefront.jpg or https://..."
                    value={editForm.image_url}
                    onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                    className="w-full bg-white border border-black/10 focus:border-blue rounded-xl px-3 py-1.5 text-xs text-label outline-none font-mono transition"
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-hairline">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-label select-none">
                  <input
                    type="checkbox"
                    checked={editForm.is_published}
                    onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })}
                    className="rounded text-blue focus:ring-blue size-4 border-black/15 cursor-pointer"
                  />
                  <span>Published on public site</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 rounded-full border border-black/10 hover:bg-fill text-muted-foreground text-xs font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue hover:bg-blue-hover text-paper text-xs font-medium transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Check className="size-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.length === 0 ? (
          <div className="md:col-span-3 surface-lift rounded-2xl bg-card border border-black/8 p-12 text-center text-xs text-subtle">
            No projects added yet. Click "Post Project" to feature client work.
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="surface-lift rounded-2xl bg-card border border-black/8 p-5 sm:p-6 shadow-[0_0_0_1px_rgb(0_0_0_/_0.04)] flex flex-col justify-between space-y-4 hover:border-black/15 transition-all"
            >
              <div className="space-y-2.5">
                {p.image_url ? (
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-black/5 border border-black/8 relative group">
                    <img
                      src={p.image_url}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-xl bg-fill/40 border border-dashed border-black/10 flex flex-col items-center justify-center text-subtle text-xs gap-1">
                    <ImageIcon className="size-4 opacity-40" />
                    <span className="text-[11px] text-muted-foreground">No picture attached</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue/10 text-blue border border-blue/20 text-[10px] font-semibold uppercase tracking-wider truncate max-w-[70%]">
                    {p.category}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await onToggleProject(p.id, !p.is_published);
                      toast.success(`Project ${p.is_published ? "hidden" : "published"}.`);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
                      p.is_published
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-black/5 text-subtle"
                    }`}
                  >
                    {p.is_published ? "● Live" : "○ Draft"}
                  </button>
                </div>

                <h3 className="font-semibold text-sm text-label font-display leading-snug line-clamp-2">
                  {p.title}
                </h3>
                {p.site_name && (
                  <div className="text-xs text-subtle font-medium">
                    {p.site_name}
                  </div>
                )}
                {p.description && (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-hairline flex items-center justify-between">
                <a
                  href={p.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-fill hover:bg-fill-elevated text-blue text-xs font-medium border border-black/8 transition-all hover:shadow-sm"
                >
                  <span>Visit Site</span>
                  <ExternalLink className="size-3" />
                </a>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(p)}
                    className="p-1.5 text-subtle hover:text-blue rounded-full hover:bg-blue/10 transition-colors cursor-pointer"
                    title="Edit project"
                  >
                    <Edit3 className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await onDeleteProject(p.id);
                      toast.info("Project deleted.");
                    }}
                    className="p-1.5 text-subtle hover:text-red-600 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
