import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  X,
  Check,
  Sparkles,
  Eye,
  Edit3,
  Image as ImageIcon,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Link as LinkIcon,
  Code,
  Table,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  AlertCircle,
  CheckCircle2,
  Laptop,
  Smartphone,
  Zap,
  TrendingUp,
  Award,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { calculateReadingTime } from "@/lib/reading-time";
import { analyzePowerWords, POWER_WORDS_DICTIONARY } from "@/lib/power-words";
import { ImagePickerModal, type ImageSelectionMeta } from "./ImagePickerModal";
import type { BlogPost } from "@/types/crm";

interface BlogEditorModalProps {
  isOpen: boolean;
  editingId: number | null;
  initialBlog?: Partial<BlogPost> | null;
  onClose: () => void;
  onSave: (data: any, status: "published" | "draft" | "archived") => Promise<boolean>;
}

const PRESET_CATEGORIES = [
  "Engineering",
  "Design Systems",
  "Performance",
  "Architecture",
  "Case Study",
  "Strategy",
  "Product Updates",
];

const PRESET_AUTHORS = [
  "Codex Dynamics Research",
  "Codex Dynamics Engineering",
  "Codex Dynamics Editorial Team",
  "Founder & Principal Architect",
];

const ARTICLE_TEMPLATES = [
  {
    id: "case-study",
    label: "Technical Case Study",
    description: "Detailed problem, architecture breakdown, benchmarks, and business results.",
    category: "Case Study",
    focusKeyword: "bespoke web architecture",
    template: `## Executive Overview

Modern enterprise platforms demand uncompromising speed, fluid interaction choreography, and sub-50ms latency. In this teardown, we analyze the architectural evolution of a high-load system.

### The Initial Bottleneck

Before the overhaul, the legacy storefront suffered from:
- Excessive client-side hydration delays exceeding 2.4 seconds on mobile devices.
- Cascading API roundtrips causing visible Cumulative Layout Shift (CLS).
- Unoptimized third-party tracking scripts blocking main-thread responsiveness.

### Architectural Blueprint

To solve this, we redesigned the critical delivery pipeline:

1. **Edge Pre-rendering**: Shipping static semantic HTML directly from global edge caches.
2. **Deterministic Layout Math**: Enforcing strict aspect ratios on all interactive canvas containers.
3. **Decoupled Telemetry Workers**: Offloading analytics to background worker threads.

\`\`\`typescript
// Precision Telemetry Beacon Worker
export function recordConversionBeacon(metric: string, value: number) {
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/telemetry", JSON.stringify({ metric, value, ts: Date.now() }));
  }
}
\`\`\`

> "Speed is not an optimization pass; it is the fundamental foundation of user trust and conversion velocity."

### Audited Performance Gains

| Metric | Legacy Platform | Codex Architecture | Lift |
| :--- | :--- | :--- | :--- |
| First Contentful Paint | 2.1s | 0.42s | +80% Faster |
| Largest Contentful Paint | 3.8s | 0.85s | +77% Faster |
| Mobile Checkout Conversion | 1.8% | 4.3% | +138% Lift |

### Summary & Takeaways

By treating typography, layout, and network requests with architectural discipline, enterprises can achieve both world-class aesthetics and market-leading conversion rates.`,
  },
  {
    id: "performance-audit",
    label: "Core Web Vitals & Speed Audit",
    description: "Deep dive into achieving 100/100 Lighthouse metrics and sub-second LCP.",
    category: "Performance",
    focusKeyword: "core web vitals optimization",
    template: `## The Zero-Latency Imperative

Every 100 milliseconds of latency reduction correlates directly with a 1.5% to 3.2% increase in sales conversion. Yet modern web platforms frequently fail Google's Core Web Vitals thresholds.

### Key Metric Diagnostic

- **LCP (Largest Contentful Paint)**: Must trigger within 1.2 seconds on 4G cellular connections.
- **INP (Interaction to Next Paint)**: Main-thread responsiveness must register under 50ms.
- **CLS (Cumulative Layout Shift)**: Target must remain strictly at 0.00.

### Three Code-Level Fixes

#### 1. Hardware-Accelerated Transforms
Never animate positional attributes like \`top\`, \`left\`, or \`margin\`. Always rely on GPU-accelerated CSS transforms:

\`\`\`css
/* High-performance CSS transform */
.smooth-card {
  will-change: transform;
  transform: translateZ(0);
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
\`\`\`

#### 2. Modern Font Loading Strategy
Preload primary display font subsets and swap font displays without visual layout jump.

#### 3. Inline Critical Path CSS
Eliminate external render-blocking stylesheets from the initial viewport payload.

> **Key Rule**: If an asset does not directly facilitate the initial viewport interaction, defer its execution.`,
  },
  {
    id: "design-systems",
    label: "Design Systems & Conversion",
    description: "How typographic scales, optical spacing, and micro-delights command premium pricing.",
    category: "Design Systems",
    focusKeyword: "bespoke design system",
    template: `## Why Generic Templates Stall Revenue

Off-the-shelf component libraries communicate an implicit signal to high-ticket buyers: commoditization. Discerning enterprise clients subconsciously evaluate technical competence through craft.

### Optical Alignment vs Mathematical Centering

Human perception is non-linear. Icons, typography, and interactive touchpoints must be optically balanced rather than mechanically centered:

1. **Typographic Cadence**: Maintaining a strict 1.25+ major second or perfect fourth step ratio.
2. **Negative Space Rhythms**: Container outer padding must always equal or exceed the inner padding between child items.
3. **Contrast Integrity**: Never placing gray text on colored backgrounds; maintaining strict WCAG AA 4.5:1 legibility.

### The Business Impact

In our comparative audits across 30+ client platform redesigns:
- **Time-on-Page**: Surged by an average of 42%.
- **Bounce Rate**: Decreased from 58% to under 26%.
- **Enterprise Lead Submissions**: Lifted by 3.4x over generic frameworks.`,
  },
];

export function BlogEditorModal({
  isOpen,
  editingId,
  initialBlog,
  onClose,
  onSave,
}: BlogEditorModalProps) {
  // Navigation Tabs in Editor
  const [activeTab, setActiveTab] = useState<"editor" | "media" | "seo" | "settings">("editor");

  // Editor sub-mode: Split / Write / Preview
  const [editorSubMode, setEditorSubMode] = useState<"split" | "write" | "preview">("split");
  const [isZenMode, setIsZenMode] = useState(false);

  // Image Picker Modal
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<"cover" | "content">("cover");

  // Power words category filter in thesaurus
  const [selectedPowerCategory, setSelectedPowerCategory] = useState<string>("all");

  // SERP preview mode
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    meta_title: "",
    meta_description: "",
    status: "published" as "published" | "draft" | "archived",
    cover_image: "",
    author: "Codex Dynamics Research",
    category: "Engineering",
    tags: ["Engineering", "Architecture"] as string[],
    focus_keyword: "",
  });

  const [tagInput, setTagInput] = useState("");
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize form when opening
  useEffect(() => {
    if (!isOpen) return;

    if (initialBlog) {
      let parsedTags: string[] = [];
      if (Array.isArray(initialBlog.tags)) {
        parsedTags = initialBlog.tags;
      } else if (typeof initialBlog.tags === "string" && initialBlog.tags.trim()) {
        try {
          const arr = JSON.parse(initialBlog.tags);
          if (Array.isArray(arr)) parsedTags = arr;
          else parsedTags = initialBlog.tags.split(",").map((t) => t.trim()).filter(Boolean);
        } catch {
          parsedTags = initialBlog.tags.split(",").map((t) => t.trim()).filter(Boolean);
        }
      }

      setForm({
        title: initialBlog.title || "",
        slug: initialBlog.slug || "",
        excerpt: initialBlog.excerpt || "",
        content: initialBlog.content || "",
        meta_title: initialBlog.meta_title || initialBlog.title || "",
        meta_description: initialBlog.meta_description || initialBlog.excerpt || "",
        status: (initialBlog.status as any) || "published",
        cover_image: initialBlog.cover_image || "",
        author: initialBlog.author || "Codex Dynamics Research",
        category: initialBlog.category || "Engineering",
        tags: parsedTags.length > 0 ? parsedTags : ["Engineering"],
        focus_keyword: initialBlog.focus_keyword || "",
      });
    } else {
      setForm({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        meta_title: "",
        meta_description: "",
        status: "published",
        cover_image: "",
        author: "Codex Dynamics Research",
        category: "Engineering",
        tags: ["Engineering", "Architecture"],
        focus_keyword: "",
      });
    }
    setActiveTab("editor");
    setIsZenMode(false);
  }, [isOpen, initialBlog]);

  // Editor Metrics
  const editorMetrics = useMemo(() => {
    const words = form.content.trim().split(/\s+/).filter(Boolean).length;
    const chars = form.content.length;
    const readingTime = calculateReadingTime(form.content);
    const paragraphs = form.content.split(/\n\s*\n/).filter(Boolean).length;
    return { words, chars, readingTime, paragraphs };
  }, [form.content]);

  // Power Words Analysis
  const powerWordsAnalysis = useMemo(() => {
    return analyzePowerWords(form.title, form.content);
  }, [form.title, form.content]);

  // Rank Math SEO Audit
  const rankMathAudit = useMemo(() => {
    const kw = form.focus_keyword.trim().toLowerCase();
    const title = form.title.toLowerCase();
    const slug = form.slug.toLowerCase();
    const metaDesc = form.meta_description.toLowerCase();
    const content = form.content.toLowerCase();
    const excerpt = form.excerpt.toLowerCase();

    let score = 0;
    const checks = [
      {
        id: "kw-title",
        label: "Focus keyword in SEO Title",
        passed: Boolean(kw && title.includes(kw)),
        points: 15,
        tip: "Place your primary focus keyword near the beginning of your title.",
      },
      {
        id: "kw-slug",
        label: "Focus keyword in URL Slug",
        passed: Boolean(kw && slug.includes(kw.replace(/\s+/g, "-"))),
        points: 10,
        tip: "Keep URL slug concise with exact hyphenated keyword.",
      },
      {
        id: "kw-meta",
        label: "Focus keyword in Meta Description",
        passed: Boolean(kw && metaDesc.includes(kw)),
        points: 15,
        tip: "Including your keyword in the meta description boosts SERP relevance.",
      },
      {
        id: "kw-first-para",
        label: "Focus keyword in Opening / Excerpt",
        passed: Boolean(kw && (excerpt.includes(kw) || content.slice(0, 300).includes(kw))),
        points: 10,
        tip: "Establish keyword relevance in the first 100 words or executive summary.",
      },
      {
        id: "kw-density",
        label: "Keyword density in Content (2+ mentions)",
        passed: Boolean(
          kw && (content.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length >= 2
        ),
        points: 10,
        tip: "Distribute your target phrase naturally across subsections.",
      },
      {
        id: "power-words-title",
        label: "High-CTR Power Words in Headline",
        passed: powerWordsAnalysis.headlineHasPowerWord,
        points: 10,
        tip: powerWordsAnalysis.headlineHasPowerWord
          ? `Detected: ${powerWordsAnalysis.headlineMatches.map((m) => m.word).join(", ")}`
          : "Add an authoritative or transformative power word to elevate CTR.",
      },
      {
        id: "power-words-content",
        label: "Authoritative Power Words in Content (3+)",
        passed: powerWordsAnalysis.contentMatches.length >= 3,
        points: 5,
        tip: `Current power words in copy: ${powerWordsAnalysis.contentMatches.length}.`,
      },
      {
        id: "title-len",
        label: "Optimal Title Length (35 - 65 chars)",
        passed: form.title.length >= 35 && form.title.length <= 65,
        points: 10,
        tip: `Current length: ${form.title.length} chars (target 35-65).`,
      },
      {
        id: "meta-len",
        label: "Optimal Meta Description (120 - 165 chars)",
        passed: form.meta_description.length >= 120 && form.meta_description.length <= 165,
        points: 10,
        tip: `Current length: ${form.meta_description.length} chars (target 120-165).`,
      },
      {
        id: "word-count",
        label: "Substantial Depth (300+ words)",
        passed: editorMetrics.words >= 300,
        points: 5,
        tip: `Current word count: ${editorMetrics.words}. In-depth engineering articles rank higher.`,
      },
    ];

    checks.forEach((c) => {
      if (c.passed) score += c.points;
    });

    return { score: Math.min(100, score), checks };
  }, [form, editorMetrics.words, powerWordsAnalysis]);

  // Title change helper
  const handleTitleChange = (val: string) => {
    const newSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setForm((prev) => ({
      ...prev,
      title: val,
      slug:
        prev.slug === "" || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
          ? newSlug
          : prev.slug,
      meta_title: prev.meta_title === "" || prev.meta_title === prev.title ? val : prev.meta_title,
    }));
  };

  // Add / Remove Tag
  const handleAddTag = (tagToAdd: string) => {
    const cleaned = tagToAdd.trim().replace(/^#/, "");
    if (!cleaned) return;
    if (!form.tags.includes(cleaned)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, cleaned] }));
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }));
  };

  // Apply Article Template
  const handleApplyTemplate = (tpl: (typeof ARTICLE_TEMPLATES)[0]) => {
    if (form.content && !window.confirm("Replace current content with this template?")) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      category: tpl.category,
      focus_keyword: prev.focus_keyword || tpl.focusKeyword,
      content: tpl.template,
      title: prev.title || tpl.label,
    }));
    toast.success(`Loaded "${tpl.label}" template!`);
    setActiveTab("editor");
  };

  // Toolbar insertions
  const insertMarkdown = (prefix: string, suffix: string = "", placeholder: string = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || placeholder;

    const replacement = prefix + selected + suffix;
    const updated = text.substring(0, start) + replacement + text.substring(end);

    setForm((prev) => ({ ...prev, content: updated }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  // Insert power word into title or content
  const handleInsertPowerWord = (pw: string, destination: "title" | "content") => {
    if (destination === "title") {
      const capitalized = pw.charAt(0).toUpperCase() + pw.slice(1);
      const newTitle = form.title ? `${form.title}: ${capitalized}` : capitalized;
      handleTitleChange(newTitle);
      toast.success(`Added power word "${capitalized}" to title!`);
    } else {
      insertMarkdown(` **${pw}** `);
      toast.success(`Inserted power word "${pw}" into article!`);
    }
  };

  // Keyboard shortcut listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      insertMarkdown("**", "**", "bold");
    } else if ((e.ctrlKey || e.metaKey) && e.key === "i") {
      e.preventDefault();
      insertMarkdown("*", "*", "italic");
    } else if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      insertMarkdown("[", "](https://codexdynamics.com)", "link");
    } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSaveSubmit("draft");
    }
  };

  // Save submission
  const handleSaveSubmit = async (statusOverride?: "published" | "draft" | "archived") => {
    if (!form.title.trim()) {
      toast.error("Article Title is required.");
      setActiveTab("settings");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Article Content is required.");
      setActiveTab("editor");
      return;
    }

    try {
      setIsSaving(true);
      const finalStatus = statusOverride || form.status;
      const finalSlug =
        form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const payload = {
        ...(editingId ? { id: editingId } : {}),
        title: form.title.trim(),
        slug: finalSlug,
        excerpt: form.excerpt.trim(),
        content: form.content,
        meta_title: form.meta_title.trim() || form.title.trim(),
        meta_description: form.meta_description.trim() || form.excerpt.trim(),
        status: finalStatus,
        cover_image: form.cover_image,
        author: form.author,
        category: form.category,
        tags: form.tags,
        focus_keyword: form.focus_keyword.trim(),
      };

      const ok = await onSave(payload, finalStatus);
      if (ok) {
        toast.success(
          editingId
            ? "Article updated successfully!"
            : finalStatus === "published"
            ? "Article published to live site!"
            : "Article saved as draft."
        );
        onClose();
      } else {
        toast.error("Failed to save article.");
      }
    } catch (err) {
      toast.error("Error saving article: " + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Simple, robust Markdown parser for live preview
  const previewHtml = useMemo(() => {
    if (!form.content) {
      return "<p class='text-muted-foreground italic text-xs'>Start writing in the editor to see your live formatted article preview...</p>";
    }

    const lines = form.content.split("\n");
    const output: string[] = [];
    let inCode = false;
    let codeBuffer: string[] = [];

    for (const rawLine of lines) {
      if (rawLine.trim().startsWith("```")) {
        if (inCode) {
          output.push(
            `<pre class="my-4 rounded-xl bg-zinc-900 text-zinc-100 p-4 text-xs font-mono overflow-x-auto border border-white/10"><code>${codeBuffer.join(
              "\n"
            )}</code></pre>`
          );
          codeBuffer = [];
          inCode = false;
        } else {
          inCode = true;
        }
        continue;
      }

      if (inCode) {
        codeBuffer.push(rawLine.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        continue;
      }

      if (!rawLine.trim()) {
        continue;
      }

      // Headers
      if (rawLine.startsWith("### ")) {
        output.push(
          `<h3 class="text-base font-bold text-label mt-5 mb-2 font-display">${rawLine.slice(4)}</h3>`
        );
        continue;
      }
      if (rawLine.startsWith("## ")) {
        output.push(
          `<h2 class="text-lg font-bold text-label mt-6 mb-2.5 pb-1 border-b border-black/8 font-display">${rawLine.slice(
            3
          )}</h2>`
        );
        continue;
      }
      if (rawLine.startsWith("# ")) {
        output.push(
          `<h1 class="text-xl font-extrabold text-label mt-6 mb-3 font-display">${rawLine.slice(2)}</h1>`
        );
        continue;
      }

      // Blockquotes & Callouts
      if (rawLine.startsWith("> ")) {
        const text = rawLine.slice(2);
        output.push(
          `<blockquote class="my-3 pl-4 border-l-2 border-blue bg-blue/[0.03] py-2 pr-3 rounded-r-xl text-xs text-muted-foreground italic font-sans">${text}</blockquote>`
        );
        continue;
      }

      // Lists
      if (rawLine.startsWith("- [ ] ")) {
        output.push(
          `<li class="list-none flex items-center gap-2 text-xs text-label my-1"><input type="checkbox" disabled class="rounded text-blue" /> <span>${rawLine.slice(
            6
          )}</span></li>`
        );
        continue;
      }
      if (rawLine.startsWith("- [x] ")) {
        output.push(
          `<li class="list-none flex items-center gap-2 text-xs text-label line-through text-muted-foreground my-1"><input type="checkbox" checked disabled class="rounded text-blue" /> <span>${rawLine.slice(
            6
          )}</span></li>`
        );
        continue;
      }
      if (rawLine.startsWith("- ") || rawLine.startsWith("* ")) {
        output.push(
          `<li class="list-disc ml-5 text-xs text-label my-1 font-sans leading-relaxed">${rawLine.slice(2)}</li>`
        );
        continue;
      }
      if (/^\d+\.\s/.test(rawLine)) {
        const text = rawLine.replace(/^\d+\.\s/, "");
        output.push(
          `<li class="list-decimal ml-5 text-xs text-label my-1 font-sans leading-relaxed">${text}</li>`
        );
        continue;
      }

      // Horizontal divider
      if (rawLine.trim() === "---" || rawLine.trim() === "***") {
        output.push(`<hr class="my-6 border-t border-black/10" />`);
        continue;
      }

      // Markdown image: ![alt](url "caption")
      const imgMatch = rawLine.match(/^!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)$/);
      if (imgMatch) {
        const alt = imgMatch[1] || "Article illustration";
        const url = imgMatch[2];
        const caption = imgMatch[3];
        output.push(
          `<figure class="my-4 rounded-xl overflow-hidden border border-black/8 shadow-xs bg-zinc-50">
            <img src="${url}" alt="${alt}" class="w-full h-auto max-h-80 object-cover" />
            ${
              caption
                ? `<figcaption class="p-2 text-[11px] text-muted-foreground text-center font-sans border-t border-black/6 bg-white">${caption}</figcaption>`
                : ""
            }
          </figure>`
        );
        continue;
      }

      // Standard paragraph with inline formatting
      const formatted = rawLine
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/6 font-mono text-[11px] text-blue">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/~~([^~]+)~~/g, "<del>$1</del>")
        .replace(/==([^=]+)==/g, '<mark class="bg-amber-200 px-1 rounded">$1</mark>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue underline underline-offset-2 hover:text-blue-hover">$1</a>');

      output.push(`<p class="text-xs text-label leading-relaxed my-2 font-sans">${formatted}</p>`);
    }

    return output.join("\n");
  }, [form.content]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white w-full transition-all duration-200 shadow-2xl border-0 sm:border border-black/10 overflow-hidden flex flex-col ${
          isZenMode
            ? "fixed inset-0 h-[100dvh] rounded-none z-50"
            : "max-w-7xl h-[100dvh] sm:h-[94vh] sm:max-h-[960px] rounded-none sm:rounded-3xl"
        }`}
      >
        {/* 1. Editor Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-black/8 bg-zinc-50/90 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Left: Title & Live Indicators */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-8 rounded-xl bg-blue/10 text-blue flex items-center justify-center shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-label truncate font-display flex items-center gap-2">
                <span className="truncate">
                  {editingId ? `Edit: ${form.title || "Untitled"}` : "Create New Blog Article"}
                </span>
                {editingId && (
                  <span className="text-[10px] font-mono bg-black/6 text-muted-foreground px-1.5 py-0.5 rounded shrink-0">
                    #{editingId}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                <span>{editorMetrics.words} words</span>
                <span>•</span>
                <span>{editorMetrics.readingTime.text}</span>
                <span>•</span>
                <span
                  className={`font-semibold ${
                    rankMathAudit.score >= 80
                      ? "text-emerald-600"
                      : rankMathAudit.score >= 50
                      ? "text-amber-600"
                      : "text-red-500"
                  }`}
                >
                  Rank Math: {rankMathAudit.score}/100
                </span>
                {powerWordsAnalysis.headlineHasPowerWord && (
                  <>
                    <span>•</span>
                    <span className="text-purple-600 font-semibold flex items-center gap-1">
                      <Zap className="size-3" />
                      <span>Power Title</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center: Main Navigation Tabs */}
          <div className="flex items-center rounded-xl bg-black/5 p-1 border border-black/6 text-xs order-3 sm:order-2 w-full sm:w-auto justify-center sm:justify-start overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "editor"
                  ? "bg-white text-blue shadow-xs font-semibold"
                  : "text-subtle hover:text-label"
              }`}
            >
              <Edit3 className="size-3.5" />
              <span>Write & Format</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "media"
                  ? "bg-white text-blue shadow-xs font-semibold"
                  : "text-subtle hover:text-label"
              }`}
            >
              <ImageIcon className="size-3.5" />
              <span>Pictures & Media</span>
              {form.cover_image && <span className="size-1.5 rounded-full bg-emerald-500" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "seo"
                  ? "bg-white text-blue shadow-xs font-semibold"
                  : "text-subtle hover:text-label"
              }`}
            >
              <Award className="size-3.5" />
              <span>Power Words & SEO</span>
              <span
                className={`text-[10px] px-1.5 rounded-full font-bold ${
                  rankMathAudit.score >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-black/10 text-label"
                }`}
              >
                {rankMathAudit.score}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "settings"
                  ? "bg-white text-blue shadow-xs font-semibold"
                  : "text-subtle hover:text-label"
              }`}
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Settings & Meta</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 order-2 sm:order-3 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => setIsZenMode(!isZenMode)}
              className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 transition-colors cursor-pointer hidden md:flex"
              title={isZenMode ? "Exit Fullscreen" : "Zen Focus Fullscreen"}
            >
              {isZenMode ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSubmit("draft")}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-black/15 text-label hover:bg-black/5 transition-all cursor-pointer disabled:opacity-50"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSubmit("published")}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-blue hover:bg-blue-hover text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="size-3.5" />
              <span>{isSaving ? "Saving..." : "Publish Article"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Close editor? Unsaved edits will be discarded.")) {
                  onClose();
                }
              }}
              className="p-1.5 rounded-full text-subtle hover:text-label hover:bg-black/5 transition-colors cursor-pointer ml-1"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* 2. Editor Workspace Body */}
        <div className="flex-1 overflow-hidden flex flex-col bg-zinc-50/40">
          {/* TAB 1: WRITE & FORMAT */}
          {activeTab === "editor" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="px-4 sm:px-6 py-2 border-b border-black/8 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0">
                {/* Formatting controls */}
                <div className="flex items-center flex-wrap gap-1">
                  {/* Inline text styles */}
                  <div className="flex items-center gap-0.5 pr-2 border-r border-black/10">
                    <button
                      type="button"
                      onClick={() => insertMarkdown("**", "**", "bold text")}
                      className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer"
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("*", "*", "italic text")}
                      className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer"
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("~~", "~~", "strikethrough")}
                      className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer"
                      title="Strikethrough"
                    >
                      <Strikethrough className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("==", "==", "highlighted text")}
                      className="px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 cursor-pointer"
                      title="Highlight text"
                    >
                      HL
                    </button>
                  </div>

                  {/* Headings */}
                  <div className="flex items-center gap-0.5 px-2 border-r border-black/10">
                    <button
                      type="button"
                      onClick={() => insertMarkdown("\n# ", "\n", "Main Section Heading")}
                      className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer"
                      title="Heading 1"
                    >
                      <Heading1 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("\n## ", "\n", "Subsection Heading")}
                      className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer"
                      title="Heading 2"
                    >
                      <Heading2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("\n### ", "\n", "Minor Heading")}
                      className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer"
                      title="Heading 3"
                    >
                      <Heading3 className="size-3.5" />
                    </button>
                  </div>

                  {/* Lists & Callouts */}
                  <div className="flex items-center gap-0.5 px-2 border-r border-black/10">
                    <button
                      type="button"
                      onClick={() => insertMarkdown("- ", "", "Bullet point item")}
                      className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer"
                      title="Bullet List"
                    >
                      <List className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("1. ", "", "First sequence item")}
                      className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer"
                      title="Numbered List"
                    >
                      <ListOrdered className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("- [ ] ", "", "Action item")}
                      className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer"
                      title="Task Checklist"
                    >
                      <CheckSquare className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("> ", "", "Important executive quote or architectural tenet")}
                      className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer"
                      title="Blockquote"
                    >
                      <Quote className="size-3.5" />
                    </button>
                  </div>

                  {/* Code & Links */}
                  <div className="flex items-center gap-0.5 px-2 border-r border-black/10">
                    <button
                      type="button"
                      onClick={() => insertMarkdown("`", "`", "codeSnippet()")}
                      className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer"
                      title="Inline Code"
                    >
                      <Code className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("\n```typescript\n", "\n```\n", "// Production code implementation")}
                      className="px-2 py-1 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer font-mono text-[11px]"
                      title="Code Block"
                    >
                      {"{ } ts"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("[", "](https://codexdynamics.com)", "link title")}
                      className="p-1.5 rounded-lg text-subtle hover:text-label hover:bg-black/5 cursor-pointer"
                      title="Insert Link (Ctrl+K)"
                    >
                      <LinkIcon className="size-3.5" />
                    </button>
                  </div>

                  {/* Picture & Media Tools */}
                  <div className="flex items-center gap-1 pl-2">
                    <button
                      type="button"
                      onClick={() => {
                        setImagePickerTarget("content");
                        setIsImagePickerOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue/10 hover:bg-blue/20 text-blue font-semibold text-xs cursor-pointer flex items-center gap-1.5"
                      title="Insert Picture with Alt & Caption"
                    >
                      <ImageIcon className="size-3.5" />
                      <span>Add Picture</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdown(
                          "\n| Metric | Baseline | Codex Engine | Gain |\n| :--- | :--- | :--- | :--- |\n| TTFB | 420ms | 45ms | +89% |\n| LCP | 2.8s | 0.8s | +71% |\n\n"
                        )
                      }
                      className="px-2 py-1 rounded-lg text-subtle hover:text-label hover:bg-black/5 text-[11px] font-medium cursor-pointer inline-flex items-center gap-1"
                      title="Insert Benchmark Table"
                    >
                      <Table className="size-3.5" />
                      <span className="hidden sm:inline">Table</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertMarkdown("\n---\n\n")}
                      className="px-2 py-1 rounded-lg text-subtle hover:text-label hover:bg-black/5 text-[11px] font-medium cursor-pointer"
                      title="Horizontal Divider"
                    >
                      Divider
                    </button>
                  </div>
                </div>

                {/* Sub-view switcher: Split / Write / Preview */}
                <div className="inline-flex rounded-xl bg-black/5 p-1 border border-black/6 text-xs">
                  <button
                    type="button"
                    onClick={() => setEditorSubMode("split")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer hidden md:block ${
                      editorSubMode === "split" ? "bg-white text-blue shadow-xs font-semibold" : "text-subtle hover:text-label"
                    }`}
                  >
                    Split View
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorSubMode("write")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      editorSubMode === "write" ? "bg-white text-blue shadow-xs font-semibold" : "text-subtle hover:text-label"
                    }`}
                  >
                    Write Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorSubMode("preview")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      editorSubMode === "preview" ? "bg-white text-blue shadow-xs font-semibold" : "text-subtle hover:text-label"
                    }`}
                  >
                    Live Preview
                  </button>
                </div>
              </div>

              {/* Editor & Preview Panes */}
              <div
                className={`flex-1 overflow-hidden grid ${
                  editorSubMode === "split"
                    ? "grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black/8"
                    : "grid-cols-1"
                }`}
              >
                {/* Write Pane */}
                {(editorSubMode === "split" || editorSubMode === "write") && (
                  <div className="flex-1 flex flex-col overflow-hidden bg-white p-4 sm:p-6">
                    <div className="flex items-center justify-between pb-2 text-[11px] text-muted-foreground font-mono shrink-0">
                      <span className="font-semibold text-subtle">MARKDOWN COMPOSITION CANVAS</span>
                      <span>
                        {editorMetrics.words} words • {editorMetrics.chars} chars • {editorMetrics.paragraphs} paragraphs
                      </span>
                    </div>

                    <textarea
                      ref={contentTextareaRef}
                      required
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      onKeyDown={handleKeyDown}
                      placeholder="Draft your article in Markdown... Use ## for section headings, > for callouts, ```typescript for code blocks, and the 'Add Picture' button for imagery."
                      className="flex-1 w-full p-4 text-xs sm:text-sm text-label font-mono bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white rounded-2xl border border-black/8 focus:border-blue outline-none resize-none leading-relaxed transition-colors shadow-inner"
                    />
                  </div>
                )}

                {/* Live Formatted Article Preview */}
                {(editorSubMode === "split" || editorSubMode === "preview") && (
                  <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-50/60 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-black/8 shrink-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue flex items-center gap-1.5">
                        <Eye className="size-3.5" />
                        <span>Public Live Article Preview</span>
                      </span>
                      <span className="text-[10px] text-subtle font-mono">Rendered Output</span>
                    </div>

                    {/* Article Header in Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue/10 text-blue font-bold text-[11px]">
                          {form.category || "Engineering"}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {editorMetrics.readingTime.text}
                        </span>
                      </div>

                      <h1 className="text-xl sm:text-3xl font-extrabold text-label font-display leading-tight">
                        {form.title || "Your Article Headline Will Appear Here"}
                      </h1>

                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>By {form.author || "Codex Dynamics"}</span>
                        <span>•</span>
                        <span>{editorMetrics.words} words</span>
                      </div>

                      {/* Excerpt Lead */}
                      {form.excerpt && (
                        <div className="p-4 rounded-2xl bg-blue/5 border border-blue/15 text-xs text-label leading-relaxed">
                          <strong className="text-blue font-semibold">Core Insight: </strong>
                          <span>{form.excerpt}</span>
                        </div>
                      )}
                    </div>

                    {/* Cover Image in Preview */}
                    {form.cover_image && (
                      <div className="rounded-2xl overflow-hidden border border-black/8 shadow-sm max-h-72">
                        <img src={form.cover_image} alt="Featured cover" className="w-full h-72 object-cover" />
                      </div>
                    )}

                    {/* Rendered HTML */}
                    <div
                      className="text-xs sm:text-sm text-label leading-relaxed space-y-3 article-preview"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PICTURES & MEDIA */}
          {activeTab === "media" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-5xl mx-auto w-full">
              {/* Featured Cover Picture */}
              <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-black/8 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-label font-display flex items-center gap-2">
                      <ImageIcon className="size-4 text-blue" />
                      <span>Featured Article Cover Picture</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      The primary visual displayed in blog cards, social share OpenGraph cards, and top hero headers.
                    </p>
                  </div>
                  {form.cover_image && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, cover_image: "" })}
                      className="px-3 py-1 text-xs font-semibold rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Remove Cover
                    </button>
                  )}
                </div>

                {form.cover_image ? (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-black/10 shadow-sm max-h-80 group">
                      <img src={form.cover_image} alt="Cover preview" className="w-full h-80 object-cover" />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setImagePickerTarget("cover");
                            setIsImagePickerOpen(true);
                          }}
                          className="px-4 py-2 bg-white text-label font-semibold text-xs rounded-xl shadow-md hover:bg-zinc-100 cursor-pointer"
                        >
                          Change Cover Picture
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span>Source: {form.cover_image}</span>
                      <span className="text-emerald-600 font-semibold">Ready for publication</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePickerTarget("cover");
                      setIsImagePickerOpen(true);
                    }}
                    className="w-full h-48 border-2 border-dashed border-black/15 hover:border-blue rounded-2xl flex flex-col items-center justify-center text-center hover:bg-blue/[0.02] transition-all cursor-pointer p-6"
                  >
                    <div className="size-12 rounded-full bg-blue/10 text-blue flex items-center justify-center mb-3">
                      <ImageIcon className="size-6" />
                    </div>
                    <span className="text-sm font-semibold text-label">Choose or Upload Featured Cover Picture</span>
                    <span className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Select from curated engineering photography, upload from your device, or paste any web asset URL.
                    </span>
                  </button>
                )}
              </div>

              {/* In-Article Picture Insertion Helper */}
              <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-black/8 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-label font-display flex items-center gap-2">
                      <Layers className="size-4 text-blue" />
                      <span>In-Article Picture & Media Inserter</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Insert figures, diagrams, and code screenshots with SEO alt text and captions directly into your text.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePickerTarget("content");
                      setIsImagePickerOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue hover:bg-blue-hover text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <ImageIcon className="size-3.5" />
                    <span>Insert Picture into Article</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-black/6 space-y-1">
                    <span className="font-bold text-label block">1. Full-Resolution Tech Stock</span>
                    <p className="text-muted-foreground">
                      Access high-impact photography of server racks, microprocessors, and design systems.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-black/6 space-y-1">
                    <span className="font-bold text-label block">2. Automatic SEO Alt Attributes</span>
                    <p className="text-muted-foreground">
                      Rank Math audits verify every image includes semantic accessibility alt descriptions.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-black/6 space-y-1">
                    <span className="font-bold text-label block">3. Captions & Figure Notes</span>
                    <p className="text-muted-foreground">
                      Add figure numbers and benchmark source credits beneath your graphics automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POWER WORDS & SEO */}
          {activeTab === "seo" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-5xl mx-auto w-full">
              {/* Power Words Copywriting Tracker Card */}
              <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/8">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <Zap className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-label font-display flex items-center gap-2">
                        <span>Copywriting Power Words Tracker</span>
                        <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          CTR Booster
                        </span>
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Audits emotional resonance and conversion psychology in headline and article body copy.
                      </p>
                    </div>
                  </div>

                  {/* Headline Score Meter */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50/60 border border-purple-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider block">
                        Headline Power Score
                      </span>
                      <span className="text-xl font-extrabold text-purple-900 font-display">
                        {powerWordsAnalysis.headlineScore} / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detected Power Words in Headline & Body */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-black/8 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-label flex items-center gap-1.5">
                        <Award className="size-3.5 text-purple-600" />
                        <span>Headline Power Words</span>
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {powerWordsAnalysis.headlineMatches.length} detected
                      </span>
                    </div>

                    {powerWordsAnalysis.headlineMatches.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {powerWordsAnalysis.headlineMatches.map((m, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-semibold text-xs"
                          >
                            <Zap className="size-3 text-purple-600" />
                            <span>{m.word}</span>
                            <span className="text-[10px] text-purple-700 font-normal">({m.categoryName})</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-700 italic pt-1">
                        No power words detected in headline. Adding an authoritative or speed power word improves organic CTR by ~34%.
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-black/8 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-label flex items-center gap-1.5">
                        <TrendingUp className="size-3.5 text-blue" />
                        <span>Content Power Words</span>
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {powerWordsAnalysis.contentMatches.length} detected
                      </span>
                    </div>

                    {powerWordsAnalysis.contentMatches.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                        {powerWordsAnalysis.contentMatches.slice(0, 8).map((m, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue/10 text-blue font-medium text-[11px]"
                          >
                            <span>{m.word}</span>
                            <span className="text-[9px] font-mono text-blue/70">×{m.count}</span>
                          </span>
                        ))}
                        {powerWordsAnalysis.contentMatches.length > 8 && (
                          <span className="text-[11px] text-muted-foreground self-center">
                            +{powerWordsAnalysis.contentMatches.length - 8} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic pt-1">
                        Incorporate transformative and benchmark terminology to establish authority.
                      </p>
                    )}
                  </div>
                </div>

                {/* Interactive Power Words Thesaurus & 1-Click Inserter */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-50/40 to-white border border-purple-200/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-purple-900 block">
                        Power Words Thesaurus & Inserter
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Click any power word to insert it directly into your headline or article cursor position.
                      </span>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedPowerCategory("all")}
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg cursor-pointer transition-colors ${
                          selectedPowerCategory === "all"
                            ? "bg-purple-700 text-white"
                            : "bg-white border border-black/10 text-subtle hover:text-label"
                        }`}
                      >
                        All
                      </button>
                      {Object.entries(POWER_WORDS_DICTIONARY).map(([key, cat]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedPowerCategory(key)}
                          className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg cursor-pointer transition-colors ${
                            selectedPowerCategory === key
                              ? "bg-purple-700 text-white"
                              : "bg-white border border-black/10 text-subtle hover:text-label"
                          }`}
                        >
                          {cat.name.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Word Chips */}
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-white rounded-xl border border-black/6">
                    {Object.entries(POWER_WORDS_DICTIONARY)
                      .filter(([key]) => selectedPowerCategory === "all" || selectedPowerCategory === key)
                      .flatMap(([, cat]) => cat.words)
                      .map((word) => (
                        <div key={word} className="inline-flex rounded-lg border border-purple-200 overflow-hidden text-xs">
                          <span className="px-2 py-1 bg-purple-50 font-medium text-purple-900 capitalize">
                            {word}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleInsertPowerWord(word, "title")}
                            className="px-1.5 py-1 bg-white hover:bg-purple-100 text-purple-700 text-[10px] font-bold border-l border-purple-200 cursor-pointer"
                            title="Add to Headline"
                          >
                            +Title
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertPowerWord(word, "content")}
                            className="px-1.5 py-1 bg-white hover:bg-blue-50 text-blue text-[10px] font-bold border-l border-purple-200 cursor-pointer"
                            title="Insert into Body"
                          >
                            +Body
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Rank Math On-Page SEO Suite & SERP Simulator */}
              <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/8">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm">
                      RM
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-label font-display">
                        Rank Math SEO & Google SERP Simulator
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        On-page search engine optimization algorithm verifying keyword placement and snippet readability.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-semibold">Audit Score:</span>
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-full border ${
                        rankMathAudit.score >= 80
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : rankMathAudit.score >= 50
                          ? "bg-amber-50 text-amber-700 border-amber-300"
                          : "bg-red-50 text-red-700 border-red-300"
                      }`}
                    >
                      {rankMathAudit.score} / 100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Focus Keyword & SERP Simulator */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-label block mb-1">
                        Primary Focus Keyword *
                      </label>
                      <input
                        type="text"
                        value={form.focus_keyword}
                        onChange={(e) => setForm({ ...form, focus_keyword: e.target.value })}
                        placeholder="e.g. bespoke web architecture"
                        className="w-full px-3.5 py-2 text-xs bg-zinc-50 hover:bg-white border border-black/15 rounded-xl focus:border-blue outline-none font-mono"
                      />
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">
                        Rank Math verifies presence in Title, URL Slug, Meta Description, and First Paragraph.
                      </span>
                    </div>

                    {/* Google SERP Simulator */}
                    <div className="p-4 rounded-2xl bg-zinc-50/80 border border-black/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-subtle">
                          Google Search SERP Preview
                        </span>
                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-black/8">
                          <button
                            type="button"
                            onClick={() => setSerpDevice("desktop")}
                            className={`p-1 rounded cursor-pointer ${
                              serpDevice === "desktop" ? "bg-black/10 text-label font-bold" : "text-subtle"
                            }`}
                            title="Desktop Snippet"
                          >
                            <Laptop className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSerpDevice("mobile")}
                            className={`p-1 rounded cursor-pointer ${
                              serpDevice === "mobile" ? "bg-black/10 text-label font-bold" : "text-subtle"
                            }`}
                            title="Mobile Snippet"
                          >
                            <Smartphone className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className={`space-y-1 font-sans ${serpDevice === "mobile" ? "max-w-xs" : ""}`}>
                        <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1 truncate">
                          <span>codexdynamics.com</span>
                          <span>›</span>
                          <span>insights</span>
                          <span>›</span>
                          <span className="text-zinc-700">{form.slug || "article-slug"}</span>
                        </div>
                        <div className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer truncate">
                          {form.meta_title || form.title || "Your Article Headline | Codex Dynamics"}
                        </div>
                        <div className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                          {form.meta_description ||
                            form.excerpt ||
                            "Explore technical architectural blueprints, Core Web Vitals optimization, and conversion engineering from Codex Dynamics."}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Rank Math Checklist */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-label block">
                      Algorithm Verification Checklist
                    </span>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {rankMathAudit.checks.map((chk) => (
                        <div
                          key={chk.id}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${
                            chk.passed ? "bg-emerald-50/50 border-emerald-200" : "bg-zinc-50 border-black/8"
                          }`}
                        >
                          {chk.passed ? (
                            <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className={`font-semibold block ${chk.passed ? "text-emerald-900" : "text-label"}`}>
                              {chk.label}
                            </span>
                            <span className="text-[11px] text-muted-foreground block mt-0.5">{chk.tip}</span>
                          </div>
                          <span className="text-[10px] font-mono text-subtle shrink-0">+{chk.points} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS & META */}
          {activeTab === "settings" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-5xl mx-auto w-full">
              {/* Primary Article Metadata */}
              <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-label font-display pb-2 border-b border-black/8">
                  Core Publishing Metadata
                </h4>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-label block">
                    Article Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Scaling Next-Generation Web Architectures in 2026"
                    className="w-full px-3.5 py-2 text-sm font-semibold bg-zinc-50 hover:bg-white border border-black/15 rounded-xl focus:border-blue outline-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 font-mono">
                    <span>
                      Permalink: <code className="text-blue">/blog?slug={form.slug || "..."}</code>
                    </span>
                    <span>{form.title.length} characters</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-label block">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-zinc-50 border border-black/15 rounded-xl focus:border-blue outline-none cursor-pointer"
                    >
                      {PRESET_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-label block">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs bg-zinc-50 border border-black/15 rounded-xl focus:border-blue outline-none cursor-pointer font-semibold"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {/* Author */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-label block">Author Attribution</label>
                    <select
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-zinc-50 border border-black/15 rounded-xl focus:border-blue outline-none cursor-pointer"
                    >
                      {PRESET_AUTHORS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom URL Slug */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-label block">Custom URL Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. bespoke-web-architecture"
                    className="w-full px-3.5 py-2 text-xs bg-zinc-50 hover:bg-white border border-black/15 rounded-xl focus:border-blue outline-none font-mono"
                  />
                </div>

                {/* Excerpt / Executive Summary */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-label flex items-center justify-between">
                    <span>Executive Summary / Excerpt</span>
                    <span className="font-mono text-muted-foreground">{form.excerpt.length} chars</span>
                  </label>
                  <textarea
                    rows={2}
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="A compelling 1-2 sentence core takeaway summarizing why this architectural insight matters..."
                    className="w-full px-3.5 py-2 text-xs bg-zinc-50 hover:bg-white border border-black/15 rounded-xl focus:border-blue outline-none leading-relaxed"
                  />
                </div>

                {/* Tags & Topics */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-label block">Tags & Topics</label>
                  <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                    {form.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-blue/10 text-blue font-mono font-medium"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-red-600 cursor-pointer ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1 max-w-sm">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      placeholder="Add tag and press Enter..."
                      className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 border border-black/15 rounded-xl focus:border-blue outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(tagInput)}
                      className="px-3 py-1.5 bg-black/5 hover:bg-black/10 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Starters / Pre-engineered Templates */}
              <div className="p-6 rounded-3xl bg-blue/5 border border-blue/15 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-blue font-bold text-sm">
                  <Sparkles className="size-4" />
                  <span>Pre-Engineered Article Templates</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Load proven engineering article skeletons with structured subsections, benchmark tables, and code blocks:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {ARTICLE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="p-4 rounded-2xl bg-white hover:border-blue hover:shadow-md border border-black/8 text-left transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-label group-hover:text-blue block">
                          {tpl.label}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-blue mt-3 block font-semibold">
                        Load Template →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Editor Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-black/8 bg-zinc-50/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span>{editingId ? `Article ID: #${editingId}` : "New Draft"}</span>
            <span>•</span>
            <span className="hidden sm:inline">{editorMetrics.words} words</span>
            <span>•</span>
            <span className="text-blue font-semibold">SEO: {rankMathAudit.score}/100</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-muted-foreground hover:text-label hover:bg-black/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSubmit("draft")}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-black/15 text-label hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveSubmit("published")}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue hover:bg-blue-hover text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="size-3.5" />
              <span>{isSaving ? "Saving..." : "Publish Article"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Image Picker Modal */}
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        currentValue={imagePickerTarget === "cover" ? form.cover_image : ""}
        title={
          imagePickerTarget === "cover"
            ? "Select or Upload Featured Cover Picture"
            : "Insert Picture into Article Content"
        }
        showMetaOptions={imagePickerTarget === "content"}
        onSelect={(url, meta?: ImageSelectionMeta) => {
          if (imagePickerTarget === "cover") {
            setForm((prev) => ({ ...prev, cover_image: url }));
            toast.success("Cover picture updated!");
          } else {
            // Build rich markdown image with alt text and caption
            const alt = meta?.alt || "Article illustration";
            const caption = meta?.caption ? ` "${meta.caption}"` : "";
            insertMarkdown(`\n![${alt}](${url}${caption})\n\n`);
            toast.success("Picture inserted into article content!");
          }
        }}
      />
    </div>
  );
}
