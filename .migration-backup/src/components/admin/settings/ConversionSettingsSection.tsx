import { useState } from "react";
import {
  Megaphone,
  MessageSquare,
  FormInput,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Layers,
  Send,
  PhoneCall,
  Mail,
  SlidersHorizontal,
} from "lucide-react";
import type { SiteConfig } from "@/types/site-editor";

interface ConversionSettingsSectionProps {
  config: SiteConfig;
  onChange: (updated: SiteConfig) => void;
}

const BANNER_VARIANTS = [
  { id: "blue", name: "Codex Blue", bgClass: "bg-[#0071E3] text-white", borderClass: "border-[#0071E3]" },
  { id: "dark", name: "Obsidian Black", bgClass: "bg-[#111113] text-white", borderClass: "border-[#111113]" },
  { id: "gradient", name: "Dynamic Gradient", bgClass: "bg-gradient-to-r from-[#0071E3] via-indigo-600 to-purple-600 text-white", borderClass: "border-indigo-600" },
  { id: "amber", name: "Gold Amber", bgClass: "bg-amber-500 text-black font-semibold", borderClass: "border-amber-500" },
  { id: "emerald", name: "Growth Emerald", bgClass: "bg-emerald-600 text-white", borderClass: "border-emerald-600" },
] as const;

type ConversionViewMode = "all" | "banner" | "whatsapp" | "form";

export function ConversionSettingsSection({ config, onChange }: ConversionSettingsSectionProps) {
  const [activeView, setActiveView] = useState<ConversionViewMode>("all");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

  const banner = config.banner || {
    enabled: true,
    text: "Q3 Project Intake Open — 2 Slots Remaining for Enterprise Architecture Rebuilds",
    ctaText: "Book Discovery Call",
    ctaUrl: "#contact",
    variant: "blue",
    dismissible: true,
  };

  const whatsapp = config.whatsapp || {
    enabled: true,
    number: "+380630000000",
    phone: "+380630000000",
    defaultMessage: "Hello Codex Dynamics team, I would like to discuss a new high-performance web project.",
    position: "bottom-right",
    showExtraChannels: true,
  };

  const contactForm = config.contactForm || {
    showBudget: true,
    showTimeline: true,
    showCompany: true,
    showServiceSelect: true,
    customSuccessMessage: "Inquiry received. Our engineering leads will review and respond within 24 hours.",
  };

  const activeFieldCount = [
    contactForm.showCompany !== false,
    contactForm.showServiceSelect !== false,
    contactForm.showBudget !== false,
    contactForm.showTimeline !== false,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* 1. Master Control Header */}
      <div className="p-5 sm:p-6 border-b border-black/[0.06] bg-gradient-to-b from-[#FAFBFD] to-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
              <SlidersHorizontal className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                Conversion & Floating Triggers Suite
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Integrated command center for announcement banners, floating messenger docks, and lead qualification flows.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#F2F2F7] rounded-xl border border-black/[0.04] self-start lg:self-auto">
          {(
            [
              { id: "all", label: "Unified View", icon: Layers },
              { id: "banner", label: "Announcement Bar", icon: Megaphone },
              { id: "whatsapp", label: "Floating Dock", icon: MessageSquare },
              { id: "form", label: "Lead Form", icon: FormInput },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveView(id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeView === id
                  ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Integrated Status Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06] border-b border-black/[0.06] bg-[#F9F9FB]">
        {/* Banner Status */}
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`size-2 rounded-full ${
                banner.enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(52,199,89,0.5)]" : "bg-neutral-300"
              }`}
            />
            <div>
              <span className="text-xs font-semibold text-neutral-900 block">Top Announcement Bar</span>
              <span className="text-[11px] text-neutral-500">
                {banner.enabled ? `Active • ${banner.variant} theme` : "Disabled"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...config,
                banner: { ...banner, enabled: !banner.enabled },
              })
            }
            className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition cursor-pointer ${
              banner.enabled
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100"
                : "bg-neutral-100 text-neutral-600 border-black/[0.06] hover:bg-neutral-200"
            }`}
          >
            {banner.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* WhatsApp Dock Status */}
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`size-2 rounded-full ${
                whatsapp.enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(52,199,89,0.5)]" : "bg-neutral-300"
              }`}
            />
            <div>
              <span className="text-xs font-semibold text-neutral-900 block">Floating Action Dock</span>
              <span className="text-[11px] text-neutral-500">
                {whatsapp.enabled ? `Active • ${whatsapp.position || "bottom-right"}` : "Disabled"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...config,
                whatsapp: { ...whatsapp, enabled: !whatsapp.enabled },
              })
            }
            className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition cursor-pointer ${
              whatsapp.enabled
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100"
                : "bg-neutral-100 text-neutral-600 border-black/[0.06] hover:bg-neutral-200"
            }`}
          >
            {whatsapp.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* Lead Form Status */}
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-[#0071E3] shadow-[0_0_8px_rgba(0,113,227,0.5)]" />
            <div>
              <span className="text-xs font-semibold text-neutral-900 block">Lead Qualification Form</span>
              <span className="text-[11px] text-neutral-500">{activeFieldCount} of 4 fields active</span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-black/[0.06]">
            {activeFieldCount}/4 Active
          </span>
        </div>
      </div>

      {/* 3. Integrated Two-Column Body */}
      <div className="grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-black/[0.06]">
        {/* Left Column: Editor Controls */}
        <div className="xl:col-span-7 p-5 sm:p-6 space-y-6">
          {/* SECTION A: Announcement Bar Settings */}
          {(activeView === "all" || activeView === "banner") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <Megaphone className="size-4 text-[#0071E3]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Top Announcement & Promo Bar
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={banner.enabled}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        banner: { ...banner, enabled: e.target.checked },
                      })
                    }
                    className="size-3.5 accent-[#0071E3] rounded cursor-pointer"
                  />
                  <span className="text-xs text-neutral-600 font-medium">Show Banner</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Announcement Headline
                  </label>
                  <input
                    type="text"
                    value={banner.text || ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        banner: { ...banner, text: e.target.value },
                      })
                    }
                    placeholder="e.g. Q3 Booking Open — 2 Slots Available"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={banner.ctaText || ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        banner: { ...banner, ctaText: e.target.value },
                      })
                    }
                    placeholder="e.g. Book Discovery Call"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Destination URL or Anchor
                  </label>
                  <input
                    type="text"
                    value={banner.ctaUrl || ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        banner: { ...banner, ctaUrl: e.target.value },
                      })
                    }
                    placeholder="#contact or https://..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1.5">
                    Color Palette & Gradient Theme
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {BANNER_VARIANTS.map((v) => {
                      const isSelected = banner.variant === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() =>
                            onChange({
                              ...config,
                              banner: { ...banner, variant: v.id as any },
                            })
                          }
                          className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs font-medium shadow-2xs ${v.bgClass} ${
                            isSelected
                              ? "ring-2 ring-offset-2 ring-[#0071E3] scale-[1.02]"
                              : "opacity-85 hover:opacity-100"
                          }`}
                        >
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION B: WhatsApp & Floating Action Dock */}
          {(activeView === "all" || activeView === "whatsapp") && (
            <div className="space-y-4 pt-4 border-t border-black/[0.06]">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Floating WhatsApp & Messenger Dock
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsapp.enabled}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        whatsapp: { ...whatsapp, enabled: e.target.checked },
                      })
                    }
                    className="size-3.5 accent-emerald-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-neutral-600 font-medium">Show Dock</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="text"
                    value={whatsapp.phone || ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        whatsapp: { ...whatsapp, phone: e.target.value, number: e.target.value },
                      })
                    }
                    placeholder="+380630000000"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Screen Position
                  </label>
                  <select
                    value={whatsapp.position || "bottom-right"}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        whatsapp: { ...whatsapp, position: e.target.value as any },
                      })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none cursor-pointer"
                  >
                    <option value="bottom-right">Bottom Right (Standard)</option>
                    <option value="bottom-left">Bottom Left (Alternative)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Pre-filled Inquiry Message
                  </label>
                  <textarea
                    rows={2}
                    value={whatsapp.defaultMessage || ""}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        whatsapp: { ...whatsapp, defaultMessage: e.target.value },
                      })
                    }
                    placeholder="Hello Codex Dynamics team, I would like to discuss a new high-performance web project."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-black/[0.06] bg-[#F9F9FB] hover:bg-neutral-50 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={whatsapp.showExtraChannels}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          whatsapp: { ...whatsapp, showExtraChannels: e.target.checked },
                        })
                      }
                      className="size-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-neutral-800 block">
                        Enable Multi-Messenger Speed-Dial Flyout
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Expands WhatsApp button into quick contacts for Telegram, Viber, Phone, and Email
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECTION C: Contact Form Field Builder */}
          {(activeView === "all" || activeView === "form") && (
            <div className="space-y-4 pt-4 border-t border-black/[0.06]">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <FormInput className="size-4 text-purple-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Lead Qualification & Form Fields
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {activeFieldCount} Fields Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    key: "showCompany" as const,
                    label: "Company / Brand Name",
                    desc: "Collect client organization or brand name",
                    active: contactForm.showCompany !== false,
                  },
                  {
                    key: "showServiceSelect" as const,
                    label: "Service Focus Dropdown",
                    desc: "Web App, E-Commerce, CRM, SEO, Ads",
                    active: contactForm.showServiceSelect !== false,
                  },
                  {
                    key: "showBudget" as const,
                    label: "Budget Range Selector",
                    desc: "$3k-$5k, $5k-$10k, $10k-$25k, $25k+",
                    active: contactForm.showBudget !== false,
                  },
                  {
                    key: "showTimeline" as const,
                    label: "Target Timeline Selector",
                    desc: "Urgent (< 2 weeks), 1 Month, Flexible",
                    active: contactForm.showTimeline !== false,
                  },
                ].map((field) => (
                  <label
                    key={field.key}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      field.active
                        ? "bg-white border-[#0071E3]/30 shadow-2xs"
                        : "bg-[#F9F9FB] border-black/[0.06] opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div className="pr-2">
                      <span className="text-xs font-semibold text-neutral-900 block">{field.label}</span>
                      <span className="text-[10px] text-neutral-500">{field.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={field.active}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          contactForm: { ...contactForm, [field.key]: e.target.checked },
                        })
                      }
                      className="size-4 accent-[#0071E3] rounded cursor-pointer shrink-0"
                    />
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Custom Confirmation Message
                </label>
                <input
                  type="text"
                  value={contactForm.customSuccessMessage || ""}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      contactForm: { ...contactForm, customSuccessMessage: e.target.value },
                    })
                  }
                  placeholder="Inquiry received. Our engineering leads will review and respond within 24 hours."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Device Mockup Canvas */}
        <div className="xl:col-span-5 bg-[#F5F5F7] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-neutral-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Live Viewport Simulation
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                    previewDevice === "desktop"
                      ? "bg-[#0071E3] text-white shadow-2xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                    previewDevice === "mobile"
                      ? "bg-[#0071E3] text-white shadow-2xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Simulated Frame */}
            <div
              className={`mx-auto bg-white rounded-2xl border border-black/[0.1] shadow-lg overflow-hidden transition-all duration-300 relative flex flex-col ${
                previewDevice === "mobile" ? "max-w-[300px] min-h-[460px]" : "w-full min-h-[440px]"
              }`}
            >
              {/* Browser Chromebar */}
              <div className="bg-[#E5E5EA] px-3 py-2 border-b border-black/[0.08] flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#FF5F56]" />
                  <span className="size-2 rounded-full bg-[#FFBD2E]" />
                  <span className="size-2 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex-1 bg-white/80 text-[9px] font-mono text-neutral-600 text-center py-0.5 rounded truncate px-2 border border-black/[0.04]">
                  codexdynamics.com
                </div>
              </div>

              {/* Simulated Live Top Banner */}
              {banner.enabled ? (
                <div
                  className={`px-3 py-2 text-[10px] flex items-center justify-between gap-1 transition-all ${
                    BANNER_VARIANTS.find((v) => v.id === banner.variant)?.bgClass || "bg-[#0071E3] text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles className="size-3 shrink-0" />
                    <span className="truncate">{banner.text || "Your announcement text..."}</span>
                  </div>
                  {banner.ctaText && (
                    <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white truncate">
                      {banner.ctaText} →
                    </span>
                  )}
                </div>
              ) : (
                <div className="bg-neutral-100 px-3 py-1 text-[9px] text-neutral-400 text-center italic border-b border-black/[0.04]">
                  Top announcement bar currently hidden
                </div>
              )}

              {/* Simulated Site Header */}
              <div className="px-3 py-2.5 border-b border-black/[0.06] flex items-center justify-between bg-white">
                <span className="text-[11px] font-bold tracking-tight text-neutral-900">
                  CODEX <span className="text-[#0071E3]">DYNAMICS</span>
                </span>
                <div className="flex items-center gap-2 text-[9px] text-neutral-500">
                  <span>Work</span>
                  <span>Services</span>
                  <span>Reviews</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-900 text-white font-medium">Contact</span>
                </div>
              </div>

              {/* Simulated Page Content */}
              <div className="p-4 flex-1 bg-gradient-to-b from-[#FBFBFD] to-[#F5F5F7] flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[9px] font-semibold mb-2">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Q3 Production Available</span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 leading-tight">
                    Precision software & digital systems.
                  </h4>
                  <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                    Custom web platforms, sales calling desks, and high-conversion ad funnels.
                  </p>
                </div>

                {/* Lead Form Qualification Preview Box */}
                <div className="mt-3 p-2.5 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-800 mb-1.5">
                    <span>Contact Form Intake</span>
                    <span className="text-[9px] text-[#0071E3] font-mono">{activeFieldCount} fields</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-5 bg-neutral-50 rounded border border-black/[0.04] px-2 flex items-center text-[9px] text-neutral-400">
                      Your Name & Email *
                    </div>
                    {contactForm.showCompany !== false && (
                      <div className="h-5 bg-neutral-50 rounded border border-black/[0.04] px-2 flex items-center text-[9px] text-neutral-500">
                        Company / Organization
                      </div>
                    )}
                    {contactForm.showServiceSelect !== false && (
                      <div className="h-5 bg-neutral-50 rounded border border-black/[0.04] px-2 flex items-center text-[9px] text-neutral-500">
                        Select Service Target ▾
                      </div>
                    )}
                    {contactForm.showBudget !== false && (
                      <div className="h-5 bg-neutral-50 rounded border border-black/[0.04] px-2 flex items-center text-[9px] text-neutral-500">
                        Project Budget Range ▾
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Action Dock Simulation */}
              {whatsapp.enabled && (
                <div
                  className={`absolute ${
                    whatsapp.position === "bottom-left" ? "bottom-3 left-3" : "bottom-3 right-3"
                  } z-20`}
                >
                  {/* Flyout if clicked */}
                  {isFlyoutOpen && whatsapp.showExtraChannels && (
                    <div className="mb-2 p-2 rounded-xl bg-white border border-black/[0.1] shadow-xl text-[10px] space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-50 text-neutral-800">
                        <Send className="size-3 text-[#229ED9]" />
                        <span>Telegram Chat</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-50 text-neutral-800">
                        <PhoneCall className="size-3 text-[#0071E3]" />
                        <span>Direct Agency Call</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-50 text-neutral-800">
                        <Mail className="size-3 text-neutral-600" />
                        <span>Send Email</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsFlyoutOpen(!isFlyoutOpen)}
                    className="size-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md relative transition-transform active:scale-95 cursor-pointer"
                  >
                    <MessageSquare className="size-4" />
                    <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-red-500 border-2 border-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-600" />
              <span>Preview updates in real-time</span>
            </span>
            <span className="font-mono text-[10px] text-neutral-400">Desktop & Mobile viewports</span>
          </div>
        </div>
      </div>
    </div>
  );
}
