import { Search, Share2, Globe, BarChart3 } from "lucide-react";
import type { SiteConfig } from "@/types/site-editor";

interface SeoSettingsSectionProps {
  config: SiteConfig;
  onChange: (updated: SiteConfig) => void;
}

export function SeoSettingsSection({ config, onChange }: SeoSettingsSectionProps) {
  const seo = config.seo || {
    metaTitle: "Codex Dynamics — High-Performance Websites & Digital Agency",
    metaDescription:
      "High-performance websites, web design, web development, and digital marketing agency. Precision engineering on every screen.",
    canonicalUrl: "https://codexdynamics.com",
    ogImage: "/hero/studio.jpg",
    gaId: "",
    gscVerification: "",
    metaPixelId: "",
  };

  const titleLength = seo.metaTitle?.length || 0;
  const descLength = seo.metaDescription?.length || 0;

  const isTitleGood = titleLength >= 45 && titleLength <= 65;
  const isDescGood = descLength >= 120 && descLength <= 165;

  return (
    <div className="space-y-6">
      {/* 1. Core Meta Tags */}
      <div className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-[#0071E3]/10 text-[#0071E3]">
            <Globe className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 tracking-tight">Global Search & OpenGraph Meta Suite</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage title tags, meta descriptions, canonical routing, and social share cards.
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-800">Default Page Title Tag</label>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                  isTitleGood ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {titleLength} / 60 chars {isTitleGood && "✓ Optimal"}
              </span>
            </div>
            <input
              type="text"
              value={seo.metaTitle || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  seo: { ...seo, metaTitle: e.target.value },
                })
              }
              placeholder="Codex Dynamics — High-Performance Websites & Digital Agency"
              className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-800">Meta Description</label>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                  isDescGood ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {descLength} / 160 chars {isDescGood && "✓ Optimal"}
              </span>
            </div>
            <textarea
              rows={3}
              value={seo.metaDescription || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  seo: { ...seo, metaDescription: e.target.value },
                })
              }
              placeholder="High-performance websites, web design, web development, and digital marketing agency..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">Canonical Base URL</label>
              <input
                type="text"
                value={seo.canonicalUrl || ""}
                onChange={(e) =>
                  onChange({
                    ...config,
                    seo: { ...seo, canonicalUrl: e.target.value },
                  })
                }
                placeholder="https://codexdynamics.com"
                className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">Social Share Image (OG Image) URL</label>
              <input
                type="text"
                value={seo.ogImage || ""}
                onChange={(e) =>
                  onChange({
                    ...config,
                    seo: { ...seo, ogImage: e.target.value },
                  })
                }
                placeholder="/hero/web-dev.jpg or https://..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Previews (SERP & Social Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google SERP Preview */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-4">
            <Search className="size-4 text-neutral-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Live Google Search Snippet Preview
            </h4>
          </div>

          <div className="p-4 rounded-xl border border-black/[0.08] bg-[#F9F9FB] font-sans text-left shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="size-6 rounded-md bg-white border border-black/[0.06] flex items-center justify-center text-[11px] font-bold text-neutral-800 shadow-2xs">
                C
              </div>
              <div className="text-[12px] leading-none text-neutral-800">
                <div className="font-medium text-neutral-900">Codex Dynamics</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">{seo.canonicalUrl || "https://codexdynamics.com"}</div>
              </div>
            </div>

            <h5 className="text-[15px] leading-snug text-[#0071E3] hover:underline cursor-pointer font-medium line-clamp-1 mt-1">
              {seo.metaTitle || "Codex Dynamics — High-Performance Websites & Digital Agency"}
            </h5>

            <p className="text-[13px] leading-relaxed text-neutral-600 mt-1 line-clamp-2">
              {seo.metaDescription ||
                "High-performance websites, web design, web development, and digital marketing agency."}
            </p>
          </div>
        </div>

        {/* Social Card Preview */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="size-4 text-neutral-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Social Sharing Card Preview (X / LinkedIn)
            </h4>
          </div>

          <div className="rounded-xl border border-black/[0.08] overflow-hidden bg-white shadow-2xs">
            <div className="h-36 bg-neutral-100 overflow-hidden flex items-center justify-center">
              {seo.ogImage ? (
                <img src={seo.ogImage} alt="OG Card preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-neutral-400 italic">No image provided</span>
              )}
            </div>

            <div className="p-3 bg-white border-t border-black/[0.06]">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">
                {seo.canonicalUrl?.replace(/^https?:\/\//, "") || "codexdynamics.com"}
              </span>
              <p className="text-xs font-bold text-neutral-900 line-clamp-1 mt-0.5">
                {seo.metaTitle || "Codex Dynamics"}
              </p>
              <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                {seo.metaDescription || "High-performance websites and digital agency."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Analytics & Search Console Keys */}
      <div className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 tracking-tight">Search Console & Web Analytics Tracking</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Inject verification tokens and analytics telemetry without editing codebase files.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Google Analytics 4 ID
            </label>
            <input
              type="text"
              value={seo.gaId || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  seo: { ...seo, gaId: e.target.value },
                })
              }
              placeholder="G-XXXXXXXXXX"
              className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition font-mono"
            />
            <span className="text-[10px] text-neutral-400 mt-1 block">Automatically initializes gtag.js</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Search Console Token
            </label>
            <input
              type="text"
              value={seo.gscVerification || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  seo: { ...seo, gscVerification: e.target.value },
                })
              }
              placeholder="google-site-verification code"
              className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition font-mono"
            />
            <span className="text-[10px] text-neutral-400 mt-1 block">Injected into document head</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Meta Pixel / LinkedIn ID
            </label>
            <input
              type="text"
              value={seo.metaPixelId || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  seo: { ...seo, metaPixelId: e.target.value },
                })
              }
              placeholder="e.g. 1234567890"
              className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] bg-[#F9F9FB] focus:border-[#0071E3] focus:bg-white text-neutral-900 outline-none transition font-mono"
            />
            <span className="text-[10px] text-neutral-400 mt-1 block">Social ad attribution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
