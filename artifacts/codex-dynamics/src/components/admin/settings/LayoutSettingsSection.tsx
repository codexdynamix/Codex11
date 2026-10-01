import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Layout,
  Compass,
  Sparkles,
  Palette,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Shield,
  Layers,
} from "lucide-react";
import type { SiteConfig, ThemeSettings } from "@/types/site-editor";
import {
  DEFAULT_HOME_SEQUENCE,
  resolveSectionsOrder,
  resolveSectionVisibility,
  isDarkHex,
} from "@/lib/theme-engine";

interface LayoutSettingsSectionProps {
  config: SiteConfig;
  onChange: (updated: SiteConfig) => void;
}

const SECTION_METADATA: Record<string, { label: string; desc: string; category: string }> = {
  hero: { label: "Hero Showcase & Reel", desc: "Interactive display, primary headline & dynamic badge", category: "Opening" },
  highlights: { label: "Bento Highlights", desc: "Precision capability matrix, live metrics & client badges", category: "Proof" },
  portfolio: { label: "Portfolio Works Showcase", desc: "Interactive project gallery with live case studies & preview modal", category: "Case Studies" },
  results: { label: "Results & Growth Metrics", desc: "Verifiable KPIs, lighthouse 100/100 scores & conversion stats", category: "Proof" },
  reviews: { label: "Client Testimonials Slider", desc: "Verified corporate client reviews and executive endorsements", category: "Social Proof" },
  about: { label: "About Agency & DNA", desc: "Philosophy, architectural principles and agency manifesto", category: "Story" },
  services: { label: "Services & Capabilities", desc: "Full spectrum of web engineering, UI/UX, and marketing offerings", category: "Offerings" },
  studio: { label: "Kyiv Office & Culture", desc: "Physical space, hardware lab & engineering culture", category: "Story" },
  blog: { label: "Insights & Technical Blog", desc: "Thought leadership, engineering breakdowns, and search engine articles", category: "Content" },
  contact: { label: "Contact & Project Inquiry", desc: "Direct inquiry form, phone, email, WhatsApp & Kyiv office map", category: "Conversion" },
};

const HERO_LAYOUT_OPTIONS = [
  { id: "streamer", label: "Streamer Showcase", desc: "Video background reel with bold typography & floating badges" },
  { id: "split", label: "Split Media (50/50)", desc: "High-contrast split editorial layout with side-by-side showcase" },
  { id: "centered", label: "Centered Minimal Focus", desc: "Pure high-impact typography with centered CTA stack" },
  { id: "bento", label: "Bento Interactive Grid", desc: "Multi-panel bento cards integrated directly into the hero zone" },
] as const;

const HEADER_OPTIONS = [
  { id: "floating", label: "Floating Island Bar", desc: "Detached pill navigation with blur backdrop" },
  { id: "minimal", label: "Clean Edge-to-Edge", desc: "Minimal borderless top navigation bar" },
  { id: "sticky", label: "Sticky Top Header", desc: "Header pinned to top on scroll with subtle border" },
] as const;

const TEMPLATE_PRESETS = [
  {
    id: "codex-gold",
    name: "Codex Pro Gold",
    badge: "Agency Default",
    desc: "Dark luxury agency with gold accents and video streamer reel",
    primary: "#F0B90B",
    secondary: "#1E2329",
    accent: "#F0B90B",
    bg: "#0F1216",
    card: "#181A20",
    heroLayout: "streamer",
    headerStyle: "floating",
    fontFamily: "system",
  },
  {
    id: "pacific-enterprise",
    name: "Pacific Tech Enterprise",
    badge: "SaaS & CRM",
    desc: "Precision enterprise blueprint with electric cyan-blue and split media showcase",
    primary: "#2979F0",
    secondary: "#162235",
    accent: "#00D2FF",
    bg: "#0B111A",
    card: "#121D2C",
    heroLayout: "split",
    headerStyle: "sticky",
    fontFamily: "mono",
  },
  {
    id: "emerald-mint",
    name: "Emerald Peak Studio",
    badge: "Creative Atelier",
    desc: "Digital studio with centered typographic focus and mint accents",
    primary: "#0ECB81",
    secondary: "#132820",
    accent: "#0ECB81",
    bg: "#0A1510",
    card: "#10221A",
    heroLayout: "centered",
    headerStyle: "minimal",
    fontFamily: "syne",
  },
  {
    id: "royal-violet",
    name: "Royal Violet Luxury",
    badge: "Editorial & Luxury",
    desc: "Editorial luxury atelier featuring bento grid layout and refined serif headers",
    primary: "#8B5CF6",
    secondary: "#241B3B",
    accent: "#A78BFA",
    bg: "#100C1B",
    card: "#1A142D",
    heroLayout: "bento",
    headerStyle: "floating",
    fontFamily: "playfair",
  },
  {
    id: "crimson-amber",
    name: "Crimson Kinetic High-ROAS",
    badge: "Performance",
    desc: "High-conversion performance marketing with dynamic energetic accents",
    primary: "#F6465D",
    secondary: "#2E151B",
    accent: "#FF6B81",
    bg: "#16090D",
    card: "#240F15",
    heroLayout: "streamer",
    headerStyle: "sticky",
    fontFamily: "system",
  },
  {
    id: "dark-obsidian",
    name: "Dark Obsidian Stealth",
    badge: "Architectural",
    desc: "Monochromatic architectural aesthetic with matte obsidian surfaces and platinum accents",
    primary: "#EAECEF",
    secondary: "#2B313A",
    accent: "#F0B90B",
    bg: "#181A20",
    card: "#21252D",
    heroLayout: "bento",
    headerStyle: "minimal",
    fontFamily: "mono",
  },
  {
    id: "titanium-light",
    name: "Titanium Apple Light",
    badge: "Clean Minimal",
    desc: "Crisp architectural light mode with frosted glass cards and Apple-grade precision",
    primary: "#0071E3",
    secondary: "#F2F2F7",
    accent: "#0071E3",
    bg: "#F5F5F7",
    card: "#FFFFFF",
    heroLayout: "centered",
    headerStyle: "floating",
    fontFamily: "system",
  },
];

export function LayoutSettingsSection({ config, onChange }: LayoutSettingsSectionProps) {
  const currentTheme: ThemeSettings = config.theme || {
    activeTheme: "codex-pro",
    fontFamily: "system",
    containerWidth: "1280px",
    borderRadius: "modern",
    heroLayout: "streamer",
    headerStyle: "floating",
  };

  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [previewPage, setPreviewPage] = useState<string>("home");
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sectionsOrder = resolveSectionsOrder(currentTheme);
  const sectionVisibility = resolveSectionVisibility(currentTheme);

  // Sync state to iframe live preview
  const postToPreview = useCallback((cfg: SiteConfig) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "CODEX_PREVIEW_UPDATE",
          config: cfg,
        },
        "*"
      );
    }
  }, []);

  useEffect(() => {
    postToPreview(config);
  }, [config, postToPreview]);

  // Listen for iframe readiness handshake
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data && e.data.type === "CODEX_PREVIEW_READY") {
        postToPreview(config);
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, [config, postToPreview]);

  const handleApplyPreset = (preset: typeof TEMPLATE_PRESETS[number]) => {
    const updated: SiteConfig = {
      ...config,
      colors: {
        ...config.colors,
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
        background: preset.bg,
        cardBg: preset.card,
        textMain: isDarkHex(preset.bg) ? "#eaecef" : "#1d1d1f",
        textMuted: isDarkHex(preset.bg) ? "#848e9c" : "#6e6e73",
      },
      theme: {
        ...currentTheme,
        activeTheme: preset.id,
        heroLayout: preset.heroLayout as any,
        headerStyle: preset.headerStyle as any,
        fontFamily: preset.fontFamily as any,
        layout: {
          ...currentTheme.layout,
          heroLayout: preset.heroLayout as any,
          sectionsOrder,
          sectionVisibility,
        },
      },
    };
    onChange(updated);
  };

  const handleColorChange = (key: "primary" | "background" | "cardBg" | "accent", value: string) => {
    const isDark = isDarkHex(key === "background" ? value : config.colors?.background);
    const updated: SiteConfig = {
      ...config,
      colors: {
        ...config.colors,
        [key]: value,
        textMain: isDark ? "#eaecef" : "#1d1d1f",
        textMuted: isDark ? "#848e9c" : "#6e6e73",
      },
    };
    onChange(updated);
  };

  const handleToggleSection = (id: string) => {
    const nextVis = {
      ...sectionVisibility,
      [id]: sectionVisibility[id] === false ? true : false,
    };

    const updated: SiteConfig = {
      ...config,
      theme: {
        ...currentTheme,
        sectionsVisibility: nextVis,
        layout: {
          ...currentTheme.layout,
          sectionVisibility: nextVis,
          sectionsVisibility: nextVis,
          sectionsOrder,
        },
      },
    };
    onChange(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionsOrder.length) return;

    const newOrder = [...sectionsOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const updated: SiteConfig = {
      ...config,
      theme: {
        ...currentTheme,
        sectionsOrder: newOrder,
        layout: {
          ...currentTheme.layout,
          sectionsOrder: newOrder,
          sectionVisibility,
        },
      },
    };
    onChange(updated);
  };

  const handleResetOrder = () => {
    const defaultOrder = [...DEFAULT_HOME_SEQUENCE];
    const defaultVis = Object.fromEntries(DEFAULT_HOME_SEQUENCE.map((id) => [id, true]));

    const updated: SiteConfig = {
      ...config,
      theme: {
        ...currentTheme,
        sectionsOrder: defaultOrder,
        sectionsVisibility: defaultVis,
        layout: {
          ...currentTheme.layout,
          sectionsOrder: defaultOrder,
          sectionVisibility: defaultVis,
          sectionsVisibility: defaultVis,
        },
      },
    };
    onChange(updated);
  };

  const handleJumpToSection = (secId: string) => {
    setHighlightedSection(secId);
    setTimeout(() => setHighlightedSection(null), 2400);

    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "CODEX_PREVIEW_SCROLL_TO",
          sectionId: secId,
        },
        "*"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <Layout className="size-5 text-blue" />
            <h2 className="text-base font-bold text-label">
              WordPress-Style Template Customizer & Live Site Studio
            </h2>
          </div>
          <p className="text-xs text-subtle mt-0.5">
            Test new templates, tweak colors, re-order section sequence, and preview all site pages in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/?preview=1${previewPage !== "home" ? `&page=${previewPage}` : ""}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-black/5 text-xs font-medium text-label transition shadow-2xs"
            title="Open preview in new tab"
          >
            <ExternalLink className="size-3.5 text-subtle" />
            <span>New Tab</span>
          </a>
        </div>
      </div>

      {/* Main 2-Column Split Customizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Theme Presets */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-5 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-label">Theme & Layout Presets</h3>
                <p className="text-[11px] text-subtle">Click any curated preset to apply colors and layouts instantly.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              {TEMPLATE_PRESETS.map((preset) => {
                const isSelected =
                  currentTheme.activeTheme === preset.id ||
                  (config.colors?.primary === preset.primary && config.colors?.background === preset.bg);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-blue bg-blue/5 shadow-xs ring-1 ring-blue"
                        : "border-black/10 hover:border-black/25 bg-white hover:bg-black/2"
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-2">
                      <span className="size-3 rounded-full border border-black/10" style={{ background: preset.primary }} />
                      <span className="size-3 rounded-full border border-black/10" style={{ background: preset.bg }} />
                      <span className="size-3 rounded-full border border-black/10" style={{ background: preset.card }} />
                      <span className="size-3 rounded-full border border-black/10" style={{ background: preset.accent }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-label line-clamp-1">{preset.name}</div>
                      <div className="text-[10px] text-subtle mt-0.5">{preset.badge}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Live Color Swatches */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-5 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 rounded-lg bg-blue/10 text-blue">
                <Palette className="size-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-label">Live Color Customizer</h3>
                <p className="text-[11px] text-subtle">Pick live colors. Changes update in the preview immediately.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-subtle uppercase">Brand Primary</label>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg border border-black/10 bg-white">
                  <input
                    type="color"
                    value={config.colors?.primary || "#0071e3"}
                    onChange={(e) => handleColorChange("primary", e.target.value)}
                    className="size-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-label">{config.colors?.primary || "#0071e3"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-subtle uppercase">Canvas BG</label>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg border border-black/10 bg-white">
                  <input
                    type="color"
                    value={config.colors?.background || "#f5f5f7"}
                    onChange={(e) => handleColorChange("background", e.target.value)}
                    className="size-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-label">{config.colors?.background || "#f5f5f7"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-subtle uppercase">Card Surface</label>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg border border-black/10 bg-white">
                  <input
                    type="color"
                    value={config.colors?.cardBg || "#ffffff"}
                    onChange={(e) => handleColorChange("cardBg", e.target.value)}
                    className="size-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-label">{config.colors?.cardBg || "#ffffff"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-subtle uppercase">Accent Tone</label>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg border border-black/10 bg-white">
                  <input
                    type="color"
                    value={config.colors?.accent || "#0071e3"}
                    onChange={(e) => handleColorChange("accent", e.target.value)}
                    className="size-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-label">{config.colors?.accent || "#0071e3"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Hero & Navigation Layout */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="size-4 text-purple-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-label">Hero Opening Block</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {HERO_LAYOUT_OPTIONS.map((opt) => {
                  const isSelected = (currentTheme.heroLayout || "streamer") === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...config,
                          theme: { ...currentTheme, heroLayout: opt.id },
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? "border-blue bg-blue/5 shadow-xs ring-1 ring-blue"
                          : "border-black/10 hover:border-black/20 bg-white"
                      }`}
                    >
                      <div className="text-xs font-bold text-label">{opt.label}</div>
                      <div className="text-[10px] text-subtle mt-0.5 line-clamp-1">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Compass className="size-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-label">Navigation Style</h4>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {HEADER_OPTIONS.map((opt) => {
                  const isSelected = (currentTheme.headerStyle || "floating") === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...config,
                          theme: { ...currentTheme, headerStyle: opt.id },
                        })
                      }
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        isSelected
                          ? "border-blue bg-blue/5 shadow-xs ring-1 ring-blue font-bold text-blue"
                          : "border-black/10 hover:border-black/20 bg-white text-label"
                      }`}
                    >
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Section Sequence & Visibility */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-label">Homepage Sections Sequence</h3>
                <p className="text-[11px] text-subtle">Re-order, toggle visibility, or click Inspect to scroll preview.</p>
              </div>
              <button
                type="button"
                onClick={handleResetOrder}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-black/10 bg-white hover:bg-black/5 text-[11px] font-medium text-label transition cursor-pointer"
                title="Reset sequence to default"
              >
                <RotateCcw className="size-3 text-subtle" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {sectionsOrder.map((secId, idx) => {
                const meta = SECTION_METADATA[secId] || {
                  label: secId.charAt(0).toUpperCase() + secId.slice(1),
                  desc: "Custom content section",
                  category: "General",
                };
                const isVisible = sectionVisibility[secId] !== false;
                const isHighlighted = highlightedSection === secId;

                return (
                  <div
                    key={secId}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition ${
                      isHighlighted
                        ? "border-amber-400 bg-amber-500/10 shadow-sm"
                        : isVisible
                        ? "border-black/8 bg-white"
                        : "border-black/5 bg-black/[0.02] opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="size-5 rounded bg-black/5 text-subtle flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                        0{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold truncate ${isVisible ? "text-label" : "text-subtle line-through"}`}>
                            {meta.label}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/5 text-subtle uppercase font-mono">
                            {meta.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isVisible && (
                        <button
                          type="button"
                          onClick={() => handleJumpToSection(secId)}
                          className="px-1.5 py-1 rounded border border-black/10 bg-black/2 hover:bg-black/5 text-[10px] font-medium text-subtle hover:text-label flex items-center gap-1 cursor-pointer"
                          title="Scroll preview to this section"
                        >
                          <Eye className="size-3" />
                          <span>Inspect</span>
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, "up")}
                        className="p-1 rounded hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed text-label cursor-pointer"
                        title="Move up"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sectionsOrder.length - 1}
                        onClick={() => handleMove(idx, "down")}
                        className="p-1 rounded hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed text-label cursor-pointer"
                        title="Move down"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSection(secId)}
                        className={`p-1 rounded cursor-pointer ${isVisible ? "text-emerald-600 hover:bg-emerald-50" : "text-subtle hover:bg-black/5"}`}
                        title={isVisible ? "Hide section" : "Show section"}
                      >
                        {isVisible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Preview Studio (7 cols) */}
        <div className="lg:col-span-7 sticky top-4">
          <div className="rounded-2xl border border-hairline bg-[#1E2329] overflow-hidden shadow-xl flex flex-col">
            {/* 1. Chrome Bar */}
            <div className="bg-[#14171A] border-b border-[#2B313A] px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-[#0B0E11] border border-[#2B313A] rounded-lg px-2.5 py-1 text-[11px] font-mono text-[#848E9C] flex-1 max-w-[280px]">
                <Shield className="size-3 text-emerald-400" />
                <span className="truncate">codexdynamics.com/{previewPage !== "home" ? previewPage : ""}</span>
              </div>

              {/* Viewport switchers */}
              <div className="flex items-center gap-1 bg-[#0B0E11] border border-[#2B313A] p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewportMode("desktop")}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    viewportMode === "desktop" ? "bg-[#2B313A] text-amber-400 font-bold" : "text-[#848E9C] hover:text-[#EAECEF]"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="size-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode("tablet")}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    viewportMode === "tablet" ? "bg-[#2B313A] text-amber-400 font-bold" : "text-[#848E9C] hover:text-[#EAECEF]"
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="size-3" />
                  <span>Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode("mobile")}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    viewportMode === "mobile" ? "bg-[#2B313A] text-amber-400 font-bold" : "text-[#848E9C] hover:text-[#EAECEF]"
                  }`}
                  title="Mobile View (390px)"
                >
                  <Smartphone className="size-3" />
                  <span>Mobile</span>
                </button>
              </div>

              {/* Zoom buttons & reload */}
              <div className="flex items-center gap-1">
                <div className="flex items-center bg-[#0B0E11] border border-[#2B313A] p-0.5 rounded-lg">
                  {[100, 85, 75].map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setZoomLevel(z)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                        zoomLevel === z ? "bg-[#2B313A] text-amber-400 font-bold" : "text-[#848E9C] hover:text-[#EAECEF]"
                      }`}
                    >
                      {z}%
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewKey((k) => k + 1)}
                  className="p-1.5 rounded-lg border border-[#2B313A] bg-[#0B0E11] text-[#848E9C] hover:text-[#EAECEF] cursor-pointer"
                  title="Reload preview"
                >
                  <RefreshCw className="size-3" />
                </button>
              </div>
            </div>

            {/* 2. Subnav Bar: Page Switcher */}
            <div className="bg-[#181C22] border-b border-[#2B313A] px-3 py-1.5 flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-1">
                {[
                  { id: "home", label: "Homepage" },
                  { id: "services", label: "Services" },
                  { id: "work", label: "Case Studies" },
                  { id: "studio", label: "Kyiv Studio" },
                  { id: "blog", label: "Insights" },
                  { id: "contact", label: "Contact" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreviewPage(p.id)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                      previewPage === p.id
                        ? "bg-amber-400/10 text-amber-400 font-bold"
                        : "text-[#848E9C] hover:text-[#EAECEF] hover:bg-white/5"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 whitespace-nowrap">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="shrink-0 whitespace-nowrap">LIVE PREVIEW</span>
                </span>
              </div>
            </div>

            {/* 3. Stage Container */}
            <div className="bg-[#0B0E11] p-4 min-h-[640px] max-h-[820px] overflow-auto flex items-start justify-center">
              <div
                className={`bg-black shadow-2xl transition-all duration-300 relative rounded-xl overflow-hidden flex flex-col ${
                  viewportMode === "desktop"
                    ? "w-full h-[680px] border border-[#363B44]"
                    : viewportMode === "tablet"
                    ? "w-[768px] h-[720px] border-8 border-[#2A2E36] rounded-[24px]"
                    : "w-[390px] h-[720px] border-8 border-[#2A2E36] rounded-[32px]"
                }`}
                style={{
                  transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
                  transformOrigin: "top center",
                  marginBottom: zoomLevel < 100 ? `-${(100 - zoomLevel) * 6}px` : undefined,
                }}
              >
                {viewportMode === "mobile" && (
                  <div className="w-20 h-4 bg-[#1E2329] rounded-b-lg mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-10" />
                )}
                <iframe
                  key={previewKey}
                  ref={iframeRef}
                  src={`/?preview=1${previewPage !== "home" ? `&page=${previewPage}` : ""}`}
                  className="w-full h-full border-0 bg-[#0F1216]"
                  onLoad={() => postToPreview(config)}
                  title="Codex Dynamics Real-Time Preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
