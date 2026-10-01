import React, { useState, useEffect } from "react";
import {
  Globe,
  Save,
  RotateCcw,
  Phone,
  MapPin,
  Sparkles,
  CheckCircle2,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Plus,
  Trash2,
  Star,
  Mail,
  ChevronDown,
  ChevronsUpDown,
  X,
} from "lucide-react";
import {
  LinkedInLogo,
  TwitterXLogo,
  GitHubLogo,
  InstagramLogo,
  FacebookLogo,
  WhatsAppLogo,
  TelegramLogo,
  ViberLogo,
  PhoneLogo,
  GmailLogo,
  MapsLogo,
} from "@/components/BrandMarks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SocialContact, AddressItem } from "@/types/site-editor";

interface SiteConfigState {
  siteName: string;
  copyrightYear: string;
  formSubmitEmail: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
}

export interface HeaderSocialItemState {
  enabled: boolean;
  url: string;
  label: string;
}

export interface HeaderSocialsState {
  linkedin: HeaderSocialItemState;
  x: HeaderSocialItemState;
  github: HeaderSocialItemState;
  instagram: HeaderSocialItemState;
  facebook: HeaderSocialItemState;
}

const DEFAULT_HEADER_SOCIALS: HeaderSocialsState = {
  linkedin: {
    enabled: true,
    url: "https://linkedin.com/company/codexdynamics",
    label: "LinkedIn",
  },
  x: {
    enabled: true,
    url: "https://x.com/codexdynamics",
    label: "X (Twitter)",
  },
  github: {
    enabled: true,
    url: "https://github.com/codexdynamics",
    label: "GitHub",
  },
  instagram: {
    enabled: true,
    url: "https://www.instagram.com/codex_dynamics/",
    label: "Instagram",
  },
  facebook: {
    enabled: true,
    url: "https://www.facebook.com/profile.php?id=61571219783449",
    label: "Facebook",
  },
};

const SOCIAL_PLATFORMS = [
  {
    key: "linkedin" as const,
    name: "LinkedIn",
    description: "Professional network & company profile",
    placeholder: "https://linkedin.com/company/...",
    logo: LinkedInLogo,
    logoClass: "size-5",
    bgClass: "bg-[#0A66C2]/10 border-[#0A66C2]/20 text-[#0A66C2]",
  },
  {
    key: "x" as const,
    name: "X (Twitter)",
    description: "Company announcements & daily thoughts",
    placeholder: "https://x.com/...",
    logo: TwitterXLogo,
    logoClass: "size-5",
    bgClass: "bg-black/10 dark:bg-white/10 border-black/15 text-label",
  },
  {
    key: "github" as const,
    name: "GitHub",
    description: "Open-source projects & code repositories",
    placeholder: "https://github.com/...",
    logo: GitHubLogo,
    logoClass: "size-5",
    bgClass: "bg-black/10 dark:bg-white/10 border-black/15 text-label",
  },
  {
    key: "instagram" as const,
    name: "Instagram",
    description: "Visual portfolio, agency culture & reels",
    placeholder: "https://www.instagram.com/...",
    logo: InstagramLogo,
    logoClass: "size-6",
    bgClass: "bg-pink-500/10 border-pink-500/20 text-pink-600",
  },
  {
    key: "facebook" as const,
    name: "Facebook",
    description: "Community page & direct client reviews",
    placeholder: "https://www.facebook.com/...",
    logo: FacebookLogo,
    logoClass: "size-6",
    bgClass: "bg-[#1877F2]/10 border-[#1877F2]/20 text-[#1877F2]",
  },
];

type FilterCategory = "all" | "phone" | "whatsapp" | "telegram" | "viber" | "address" | "email" | "header_socials" | "brand";

function ContactExtraValuesEditor({
  contact,
  onAddExtra,
  onUpdateExtra,
  onRemoveExtra,
  placeholder,
}: {
  contact: SocialContact;
  onAddExtra: (id: string) => void;
  onUpdateExtra: (id: string, index: number, value: string) => void;
  onRemoveExtra: (id: string, index: number) => void;
  placeholder?: string;
}) {
  const extras = Array.isArray(contact.extraValues) ? contact.extraValues : [];

  return (
    <div className="pt-2 border-t border-hairline/60 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
          Multiple Endpoints ({extras.length})
        </span>
        <button
          type="button"
          onClick={() => onAddExtra(contact.id)}
          className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 cursor-pointer"
        >
          <Plus className="size-3" />
          <span>+ Add Value</span>
        </button>
      </div>

      {extras.length > 0 && (
        <div className="space-y-1.5">
          {extras.map((val, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                type="text"
                value={val}
                placeholder={placeholder || `Additional endpoint #${idx + 2}`}
                onChange={(e) => onUpdateExtra(contact.id, idx, e.target.value)}
                className="flex-1 bg-white dark:bg-black/20 border border-black/8 focus:border-emerald-500 rounded-md px-2.5 py-1 text-xs text-label font-mono outline-none transition"
              />
              <button
                type="button"
                onClick={() => onRemoveExtra(contact.id, idx)}
                className="size-6 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition cursor-pointer"
                title="Remove this extra value"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SiteContentTabProps {
  onSwitchTab?: (tab: any) => void;
}

export function SiteContentTab({ onSwitchTab }: SiteContentTabProps = {}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const toggleSection = (sec: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sec]: !prev[sec],
    }));
  };

  const areAllCollapsed = Object.values(collapsedSections).filter(Boolean).length >= 5;

  const handleToggleAllSections = () => {
    if (areAllCollapsed) {
      setCollapsedSections({});
    } else {
      setCollapsedSections({
        phone: true,
        whatsapp: true,
        telegram: true,
        viber: true,
        address: true,
        email: true,
        header_socials: true,
        brand: true,
      });
    }
  };

  const [form, setForm] = useState<SiteConfigState>({
    siteName: "Codex Dynamics",
    copyrightYear: "2026",
    formSubmitEmail: "codexdynamix@gmail.com",
    heroBadge: "Codex Dynamics",
    heroTitle: "Precision on every screen.",
    heroSubtitle: "Websites, web apps, and social campaigns — composed with the care of a product launch.",
  });

  const [headerSocials, setHeaderSocials] = useState<HeaderSocialsState>(DEFAULT_HEADER_SOCIALS);
  const [contacts, setContacts] = useState<SocialContact[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [rawConfig, setRawConfig] = useState<Record<string, any>>({});

  const computeHref = (type: SocialContact["type"], val: string) => {
    const clean = val.trim();
    if (!clean) return "";
    switch (type) {
      case "phone":
        return `tel:${clean.replace(/[^\d+]/g, "")}`;
      case "whatsapp":
        return `https://wa.me/${clean.replace(/[^0-9]/g, "")}`;
      case "telegram":
        return clean.startsWith("http")
          ? clean
          : `https://t.me/${clean.replace(/^@/, "").replace(/[^a-zA-Z0-9_+]/g, "")}`;
      case "viber":
        return `viber://chat?number=${encodeURIComponent(clean.startsWith("+") ? clean : `+${clean}`)}`;
      case "email":
        return `mailto:${clean}`;
      default:
        return clean.startsWith("http") ? clean : `https://${clean}`;
    }
  };

  const fetchCurrentConfig = async () => {
    try {
      setLoading(true);
      const raw = typeof window !== "undefined" ? localStorage.getItem("codex_site_config") : null;
      const cfg = raw ? JSON.parse(raw) : {};
      setRawConfig(cfg);

      setForm({
        siteName: cfg.siteName || "Codex Dynamics",
        copyrightYear: cfg.copyrightYear || "2026",
        formSubmitEmail: cfg.formSubmitEmail || "codexdynamix@gmail.com",
        heroBadge: cfg.hero?.badge || "Codex Dynamics",
        heroTitle: cfg.hero?.title || "Precision on every screen.",
        heroSubtitle:
          cfg.hero?.subtitle ||
          "Websites, web apps, and social campaigns — composed with the care of a product launch.",
      });

      if (Array.isArray(cfg.socialContacts) && cfg.socialContacts.length > 0) {
        setContacts(cfg.socialContacts);
      } else {
        // Defaults if empty
        setContacts([
          {
            id: "ph-1",
            type: "phone",
            label: "Direct Call / Desk",
            value: "+380 63 640 6783",
              href: "tel:+380636406783",
              isPrimary: true,
            },
            {
              id: "ph-2",
              type: "phone",
              label: "Kyiv HQ Landline",
              value: "+380 44 233 4567",
              href: "tel:+380442334567",
              isPrimary: false,
            },
            {
              id: "wa-1",
              type: "whatsapp",
              label: "Main WhatsApp",
              value: "+380636406783",
              href: "https://wa.me/380636406783",
              isPrimary: true,
            },
            {
              id: "wa-2",
              type: "whatsapp",
              label: "Support Desk WhatsApp",
              value: "+380636406783",
              href: "https://wa.me/380636406783",
              isPrimary: false,
            },
            {
              id: "tg-1",
              type: "telegram",
              label: "Official Telegram",
              value: "+380636406783",
              href: "https://t.me/+380636406783",
              isPrimary: true,
            },
            {
              id: "tg-2",
              type: "telegram",
              label: "Client Success Desk",
              value: "@codex_desk",
              href: "https://t.me/codex_desk",
              isPrimary: false,
            },
            {
              id: "vb-1",
              type: "viber",
              label: "Direct Viber",
              value: "+380636406783",
              href: "viber://chat?number=%2B380636406783",
              isPrimary: true,
            },
            {
              id: "vb-2",
              type: "viber",
              label: "Support Line Viber",
              value: "+380 50 123 4567",
              href: "viber://chat?number=%2B380501234567",
              isPrimary: false,
            },
            {
              id: "em-1",
              type: "email",
              label: "Primary Email",
              value: "codexdynamix@gmail.com",
              href: "mailto:codexdynamix@gmail.com",
              isPrimary: true,
            },
            {
              id: "em-2",
              type: "email",
              label: "Direct Agency Desk",
              value: "hello@codexdynamics.com",
              href: "mailto:hello@codexdynamics.com",
              isPrimary: false,
            },
          ]);
        }

        if (Array.isArray(cfg.addresses) && cfg.addresses.length > 0) {
          setAddresses(cfg.addresses);
        } else {
          setAddresses([
            {
              id: "addr-1",
              label: "Kyiv Office (HQ)",
              street: "Sportyvna, 1A",
              city: "Kyiv, 012023, Ukraine",
              fullAddress: "Sportyvna, 1A, Kyiv, 012023, Ukraine",
              lat: 50.438743,
              lng: 30.523177,
              isPrimary: true,
            },
            {
              id: "addr-2",
              label: "Gulliver Tower Desk",
              street: "Ploshcha Sportyvna, 1A",
              city: "Kyiv, Ukraine",
              fullAddress: "Ploshcha Sportyvna 1A, Gulliver Tower A, Kyiv",
              lat: 50.438743,
              lng: 30.523177,
              isPrimary: false,
            },
          ]);
        }

        if (cfg.headerSocials) {
          setHeaderSocials({
            linkedin: {
              enabled: cfg.headerSocials.linkedin?.enabled !== false,
              url: cfg.headerSocials.linkedin?.url || DEFAULT_HEADER_SOCIALS.linkedin.url,
              label: "LinkedIn",
            },
            x: {
              enabled: cfg.headerSocials.x?.enabled !== false,
              url: cfg.headerSocials.x?.url || DEFAULT_HEADER_SOCIALS.x.url,
              label: "X (Twitter)",
            },
            github: {
              enabled: cfg.headerSocials.github?.enabled !== false,
              url: cfg.headerSocials.github?.url || DEFAULT_HEADER_SOCIALS.github.url,
              label: "GitHub",
            },
            instagram: {
              enabled: cfg.headerSocials.instagram?.enabled !== false,
              url: cfg.headerSocials.instagram?.url || DEFAULT_HEADER_SOCIALS.instagram.url,
              label: "Instagram",
            },
            facebook: {
              enabled: cfg.headerSocials.facebook?.enabled !== false,
              url: cfg.headerSocials.facebook?.url || DEFAULT_HEADER_SOCIALS.facebook.url,
              label: "Facebook",
            },
          });
        }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  // Multi-contact helpers
  const handleAddContact = (type: SocialContact["type"]) => {
    const existing = contacts.filter((c) => c.type === type);
    const count = existing.length + 1;

    let defaultLabel = "";
    let defaultValue = "";

    switch (type) {
      case "phone":
        defaultLabel = count === 1 ? "Direct Call / Desk" : `Phone Line #${count}`;
        defaultValue = "+380 63 000 0000";
        break;
      case "whatsapp":
        defaultLabel = count === 1 ? "Main WhatsApp" : `WhatsApp Desk #${count}`;
        defaultValue = "+380630000000";
        break;
      case "telegram":
        defaultLabel = count === 1 ? "Official Telegram" : `Telegram Desk #${count}`;
        defaultValue = "@codexdynamics";
        break;
      case "viber":
        defaultLabel = count === 1 ? "Direct Viber" : `Viber Line #${count}`;
        defaultValue = "+380630000000";
        break;
      case "email":
        defaultLabel = count === 1 ? "Primary Inquiries" : `Inbox #${count}`;
        defaultValue = "contact@codexdynamics.com";
        break;
      default:
        defaultLabel = `Contact #${count}`;
        defaultValue = "";
    }

    const newContact: SocialContact = {
      id: `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      label: defaultLabel,
      value: defaultValue,
      href: computeHref(type, defaultValue),
      isPrimary: existing.length === 0,
      isVisible: true,
    };

    setContacts((prev) => [...prev, newContact]);
    toast.success(`Added new ${type} contact.`);
  };

  const handleUpdateContact = (id: string, updates: Partial<SocialContact>) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...updates };
        if (updates.value !== undefined) {
          updated.href = computeHref(updated.type, updates.value);
        }
        return updated;
      })
    );
  };

  const handleSetPrimaryContact = (id: string, type: SocialContact["type"]) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.type !== type) return c;
        return { ...c, isPrimary: c.id === id };
      })
    );
    toast.info(`Updated primary ${type} contact.`);
  };

  const handleRemoveContact = (id: string) => {
    setContacts((prev) => {
      const target = prev.find((c) => c.id === id);
      const remaining = prev.filter((c) => c.id !== id);
      if (target?.isPrimary && target.type) {
        const nextFirst = remaining.find((c) => c.type === target.type);
        if (nextFirst) nextFirst.isPrimary = true;
      }
      return [...remaining];
    });
    toast.info("Contact removed.");
  };

  const handleAddExtraValue = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const currentExtras = Array.isArray(c.extraValues) ? [...c.extraValues] : [];
        return {
          ...c,
          extraValues: [...currentExtras, ""],
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateExtraValue = (id: string, index: number, value: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const currentExtras = Array.isArray(c.extraValues) ? [...c.extraValues] : [];
        currentExtras[index] = value;
        return {
          ...c,
          extraValues: currentExtras,
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleRemoveExtraValue = (id: string, index: number) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const currentExtras = Array.isArray(c.extraValues) ? [...c.extraValues] : [];
        currentExtras.splice(index, 1);
        return {
          ...c,
          extraValues: currentExtras,
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  // Multi-address helpers
  const handleAddAddress = () => {
    const count = addresses.length + 1;
    const newAddress: AddressItem = {
      id: `addr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      label: `Office #${count}`,
      street: "Sportyvna, 1A",
      city: "Kyiv, Ukraine",
      fullAddress: "Sportyvna, 1A, Kyiv, Ukraine",
      lat: 50.438743,
      lng: 30.523177,
      isPrimary: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, newAddress]);
    toast.success("Added new office address.");
  };

  const handleUpdateAddress = (id: string, updates: Partial<AddressItem>) => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const handleSetPrimaryAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isPrimary: a.id === id }))
    );
    toast.info("Updated primary office address.");
  };

  const handleRemoveAddress = (id: string) => {
    if (addresses.length <= 1) {
      toast.error("You must maintain at least one office address.");
      return;
    }
    setAddresses((prev) => {
      const target = prev.find((a) => a.id === id);
      const remaining = prev.filter((a) => a.id !== id);
      if (target?.isPrimary && remaining[0]) {
        remaining[0].isPrimary = true;
      }
      return [...remaining];
    });
    toast.info("Office address removed.");
  };

  // Social URLs
  const handleToggleSocial = (key: keyof HeaderSocialsState) => {
    setHeaderSocials((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const handleUpdateSocialUrl = (key: keyof HeaderSocialsState, url: string) => {
    setHeaderSocials((prev) => ({
      ...prev,
      [key]: { ...prev[key], url },
    }));
  };

  const handleEnableAllSocials = () => {
    setHeaderSocials((prev) => ({
      linkedin: { ...prev.linkedin, enabled: true },
      x: { ...prev.x, enabled: true },
      github: { ...prev.github, enabled: true },
      instagram: { ...prev.instagram, enabled: true },
      facebook: { ...prev.facebook, enabled: true },
    }));
    toast.info("All 5 header buttons enabled");
  };

  const handleDisableAllSocials = () => {
    setHeaderSocials((prev) => ({
      linkedin: { ...prev.linkedin, enabled: false },
      x: { ...prev.x, enabled: false },
      github: { ...prev.github, enabled: false },
      instagram: { ...prev.instagram, enabled: false },
      facebook: { ...prev.facebook, enabled: false },
    }));
    toast.info("All header social buttons hidden");
  };

  const handleResetSocialUrls = () => {
    setHeaderSocials(DEFAULT_HEADER_SOCIALS);
    toast.info("Restored default credentials & URLs");
  };

  const handleCopyUrl = (key: string, url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);

      // Keep header socials in sync with contacts
      const updatedContacts = [...contacts];

      // Sync header social items to contacts if not present
      const syncHeaderSocial = (type: SocialContact["type"], key: keyof HeaderSocialsState, defaultVal: string) => {
        const item = headerSocials[key];
        const existingIdx = updatedContacts.findIndex((c) => c.type === type);
        if (existingIdx >= 0) {
          updatedContacts[existingIdx] = {
            ...updatedContacts[existingIdx],
            href: item.url,
            isVisible: item.enabled,
          };
        } else {
          updatedContacts.push({
            id: `${key}-1`,
            type,
            label: item.label,
            value: defaultVal,
            href: item.url,
            isVisible: item.enabled,
            isPrimary: true,
          });
        }
      };

      syncHeaderSocial("linkedin", "linkedin", "codexdynamics");
      syncHeaderSocial("twitter", "x", "codexdynamics");
      syncHeaderSocial("github", "github", "codexdynamics");
      syncHeaderSocial("instagram", "instagram", "codex_dynamics");
      syncHeaderSocial("facebook", "facebook", "Codex Dynamics");

      const payloadConfig = {
        ...rawConfig,
        siteName: form.siteName,
        copyrightYear: form.copyrightYear,
        formSubmitEmail: form.formSubmitEmail,
        hero: {
          ...(rawConfig.hero || {}),
          badge: form.heroBadge,
          title: form.heroTitle,
          subtitle: form.heroSubtitle,
        },
        headerSocials,
        socialContacts: updatedContacts,
        addresses,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("codex_site_config", JSON.stringify(payloadConfig));
      }
      toast.success("All contacts, phone lines, whatsapps, addresses & copy saved!");
      setContacts(updatedContacts);
    } catch {
      toast.error("Error while saving site content.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all site texts, phone numbers, and addresses back to default?")) return;
    try {
      setResetting(true);
      if (typeof window !== "undefined") {
        localStorage.removeItem("codex_site_config");
      }
      toast.success("Site content reset to factory defaults.");
      setHeaderSocials(DEFAULT_HEADER_SOCIALS);
      fetchCurrentConfig();
    } catch {
      toast.error("Failed to reset site content.");
    } finally {
      setResetting(false);
    }
  };

  // Grouped contacts for rendering
  const phones = contacts.filter((c) => c.type === "phone");
  const whatsapps = contacts.filter((c) => c.type === "whatsapp");
  const telegrams = contacts.filter((c) => c.type === "telegram");
  const vibers = contacts.filter((c) => c.type === "viber");
  const emails = contacts.filter((c) => c.type === "email");

  const activeCount = Object.values(headerSocials).filter((s) => s.enabled).length;

  return (
    <div className="space-y-6">
      {onSwitchTab && (
        <div className="surface-lift rounded-2xl bg-gradient-to-r from-blue/5 via-purple-500/5 to-emerald-500/5 border border-black/10 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="size-9 rounded-xl bg-blue/10 text-blue flex items-center justify-center shrink-0">
              <Sparkles className="size-4" />
            </span>
            <div>
              <span className="text-xs font-semibold text-label">
                Looking for Color Schemes, Section Ordering, WhatsApp Floating Docks, or SEO?
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                The Site Customizer gives you real-time controls for colorways, corner radiuses, section visibility/ordering, conversion docks, and emergency mode.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab("customizer")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue hover:bg-blue-600 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition"
          >
            <Sparkles className="size-3.5" />
            <span>Open Site Customizer</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="surface-lift rounded-2xl bg-card border border-black/8 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="size-5 text-blue" />
            <h2 className="text-base font-semibold text-label font-display tracking-tight">
              Multi-Contact Center & Website Copy
            </h2>
            {hasUnsavedChanges ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved Edits
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600">
                <Check className="size-3" />
                Saved
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage multiple phone lines, WhatsApps, Telegrams, Vibers, and office locations with compact dropdowns and dedicated save buttons.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 hover:bg-fill text-muted-foreground hover:text-label text-xs font-medium transition-all cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-white text-xs font-semibold transition-all shadow-xs active:scale-[0.99] cursor-pointer",
              hasUnsavedChanges ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue hover:bg-blue-hover"
            )}
          >
            <Save className="size-3.5" />
            <span>{saving ? "Saving..." : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Space-Saving Dropdown Toolbar */}
      <div className="surface-lift rounded-2xl bg-card border border-black/8 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: View Filter Dropdown & Expand/Collapse Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Section:
            </span>
            <div className="relative">
              <select
                value={activeCategory}
                onChange={(e) => {
                  const cat = e.target.value as FilterCategory;
                  setActiveCategory(cat);
                  if (cat !== "all") {
                    setCollapsedSections((prev) => ({ ...prev, [cat]: false }));
                  }
                }}
                className="appearance-none bg-fill/60 hover:bg-fill border border-black/10 hover:border-black/20 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-label outline-none cursor-pointer transition shadow-2xs"
              >
                <option value="all">📁 All Sections ({phones.length + whatsapps.length + telegrams.length + vibers.length + emails.length + addresses.length} contacts)</option>
                <option value="phone">📞 Phone Numbers ({phones.length})</option>
                <option value="whatsapp">💬 WhatsApp Lines ({whatsapps.length})</option>
                <option value="telegram">✈️ Telegram Accounts ({telegrams.length})</option>
                <option value="viber">🟣 Viber Support Lines ({vibers.length})</option>
                <option value="address">📍 Office Locations ({addresses.length})</option>
                <option value="email">✉️ Email Inboxes ({emails.length})</option>
                <option value="header_socials">🌐 Header Socials ({activeCount}/5 active)</option>
                <option value="brand">✨ Brand & Hero Copy</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAllSections}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 hover:bg-fill text-muted-foreground hover:text-label text-xs font-medium transition cursor-pointer"
            title="Toggle compact view for all sections"
          >
            <ChevronsUpDown className="size-3.5" />
            <span>{areAllCollapsed ? "Expand All" : "Collapse All"}</span>
          </button>
        </div>

        {/* Right: + Add Channel Dropdown & Section Save Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value=""
              onChange={(e) => {
                const type = e.target.value;
                if (!type) return;
                if (type === "address") {
                  handleAddAddress();
                  setCollapsedSections((prev) => ({ ...prev, address: false }));
                  setActiveCategory((prev) => (prev === "all" ? "all" : "address"));
                } else {
                  handleAddContact(type as SocialContact["type"]);
                  setCollapsedSections((prev) => ({ ...prev, [type]: false }));
                  setActiveCategory((prev) => (prev === "all" ? "all" : (type as FilterCategory)));
                }
                setHasUnsavedChanges(true);
                e.target.value = "";
              }}
              className="appearance-none bg-blue hover:bg-blue-hover text-white text-xs font-semibold px-3.5 py-1.5 pr-8 rounded-xl shadow-xs transition cursor-pointer border-none"
            >
              <option value="" disabled>+ Add Channel / Contact ▾</option>
              <option value="phone">📞 + Phone Number</option>
              <option value="whatsapp">💬 + WhatsApp Line</option>
              <option value="telegram">✈️ + Telegram Account</option>
              <option value="viber">🟣 + Viber Line</option>
              <option value="address">📍 + Office Address</option>
              <option value="email">✉️ + Email Inbox</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/90" />
          </div>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            title="Save all changes to database"
          >
            <Save className="size-3.5" />
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="surface-lift rounded-2xl bg-card border border-black/8 p-12 text-center text-xs text-subtle">
          Loading site configuration from SQLite...
        </div>
      ) : (
        <div className="space-y-6">
          {/* PHONE NUMBERS SECTION */}
          {(activeCategory === "all" || activeCategory === "phone") && (
            <div className="surface-lift rounded-2xl bg-card border border-black/8 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
                <button
                  type="button"
                  onClick={() => toggleSection("phone")}
                  className="flex items-center gap-2.5 text-left group cursor-pointer"
                >
                  <div className="size-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-label group-hover:text-blue transition">
                        Direct Phone Numbers ({phones.length})
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                        Click-to-Call
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Add mobile desks, landlines, sales hotlines. Primary line features on hero and call buttons.
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddContact("phone");
                      setCollapsedSections((prev) => ({ ...prev, phone: false }));
                      setHasUnsavedChanges(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Phone</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-600/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition cursor-pointer shadow-2xs"
                    title="Save phone numbers to database"
                  >
                    <Save className="size-3.5" />
                    <span>Save Phones</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSection("phone")}
                    className="size-7 rounded-lg hover:bg-fill text-muted-foreground flex items-center justify-center transition cursor-pointer"
                    title={collapsedSections.phone ? "Expand section" : "Collapse section"}
                  >
                    <ChevronDown className={cn("size-4 transition-transform duration-200", collapsedSections.phone && "-rotate-90")} />
                  </button>
                </div>
              </div>

              {!collapsedSections.phone && (
                <>

              {phones.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-black/10 rounded-xl">
                  No phone numbers configured. Click "Add Phone Number" to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {phones.map((p, _idx) => (
                    <div
                      key={p.id}
                      className={cn(
                        "rounded-xl border p-4 transition-all relative space-y-3",
                        p.isPrimary
                          ? "border-emerald-500/40 bg-emerald-500/[0.03] shadow-xs"
                          : "border-black/8 bg-fill/30 hover:border-black/15"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <PhoneLogo className="size-5 shrink-0" />
                          <select
                            value={p.type}
                            onChange={(e) => {
                              const newType = e.target.value as SocialContact["type"];
                              handleUpdateContact(p.id, {
                                type: newType,
                                href: computeHref(newType, p.value),
                              });
                              setHasUnsavedChanges(true);
                              toast.info(`Changed contact type to ${newType}.`);
                            }}
                            className="bg-fill/60 hover:bg-fill border border-black/10 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-label outline-none cursor-pointer"
                            title="Change channel type"
                          >
                            <option value="phone">📞 Phone</option>
                            <option value="whatsapp">💬 WhatsApp</option>
                            <option value="telegram">✈️ Telegram</option>
                            <option value="viber">🟣 Viber</option>
                            <option value="email">✉️ Email</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              handleSetPrimaryContact(p.id, "phone");
                              setHasUnsavedChanges(true);
                            }}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer",
                              p.isPrimary
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-black/5 dark:bg-white/5 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600"
                            )}
                          >
                            <Star className={cn("size-2.5", p.isPrimary && "fill-current")} />
                            <span>{p.isPrimary ? "Primary Line" : "Make Primary"}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveContact(p.id);
                            setHasUnsavedChanges(true);
                          }}
                          className="size-7 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition cursor-pointer"
                          title="Delete phone number"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                            Line Label / Purpose
                          </label>
                          <input
                            type="text"
                            value={p.label || ""}
                            placeholder="e.g. Sales Desk, Kyiv Landline, Emergency"
                            onChange={(e) => handleUpdateContact(p.id, { label: e.target.value })}
                            className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-label outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                            Primary Phone Number
                          </label>
                          <input
                            type="text"
                            value={p.value}
                            placeholder="+380 63 640 6783"
                            onChange={(e) => handleUpdateContact(p.id, { value: e.target.value })}
                            className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-label font-mono outline-none transition"
                          />
                        </div>

                        <ContactExtraValuesEditor
                          contact={p}
                          onAddExtra={handleAddExtraValue}
                          onUpdateExtra={handleUpdateExtraValue}
                          onRemoveExtra={handleRemoveExtraValue}
                          placeholder="+380 44 123 4567"
                        />
                      </div>

                      <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-mono truncate max-w-[200px]">
                          {p.href || `tel:${p.value}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(`phone-${p.id}`, p.value)}
                            className="text-muted-foreground hover:text-label inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="size-3" />
                            <span>Copy</span>
                          </button>
                          <a
                            href={p.href || `tel:${p.value}`}
                            className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="size-3" />
                            <span>Test Call</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* WHATSAPP NUMBERS SECTION */}
          {(activeCategory === "all" || activeCategory === "whatsapp") && (
            <div className="surface-lift rounded-2xl bg-card border border-black/8 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <WhatsAppLogo className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                        WhatsApp Business & Direct Lines ({whatsapps.length})
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                        Instant Chat wa.me
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Configure multiple WhatsApp numbers (e.g. Sales, Support, Technical). Links automatically generate direct wa.me chat URLs.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddContact("whatsapp")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span>Add WhatsApp Line</span>
                </button>
              </div>

              {whatsapps.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-black/10 rounded-xl">
                  No WhatsApp lines configured. Click "Add WhatsApp Line" to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {whatsapps.map((w, _idx) => (
                    <div
                      key={w.id}
                      className={cn(
                        "rounded-xl border p-4 transition-all relative space-y-3",
                        w.isPrimary
                          ? "border-emerald-500/40 bg-emerald-500/[0.03] shadow-xs"
                          : "border-black/8 bg-fill/30 hover:border-black/15"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <WhatsAppLogo className="size-5 shrink-0" />
                          <select
                            value={w.type}
                            onChange={(e) => {
                              const newType = e.target.value as SocialContact["type"];
                              handleUpdateContact(w.id, {
                                type: newType,
                                href: computeHref(newType, w.value),
                              });
                              setHasUnsavedChanges(true);
                              toast.info(`Changed contact type to ${newType}.`);
                            }}
                            className="bg-fill/60 hover:bg-fill border border-black/10 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-label outline-none cursor-pointer"
                            title="Change channel type"
                          >
                            <option value="phone">📞 Phone</option>
                            <option value="whatsapp">💬 WhatsApp</option>
                            <option value="telegram">✈️ Telegram</option>
                            <option value="viber">🟣 Viber</option>
                            <option value="email">✉️ Email</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleSetPrimaryContact(w.id, "whatsapp")}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer",
                              w.isPrimary
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-black/5 dark:bg-white/5 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600"
                            )}
                          >
                            <Star className={cn("size-2.5", w.isPrimary && "fill-current")} />
                            <span>{w.isPrimary ? "Primary WhatsApp" : "Make Primary"}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveContact(w.id)}
                          className="size-7 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition cursor-pointer"
                          title="Delete WhatsApp"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                            Desk / Account Label
                          </label>
                          <input
                            type="text"
                            value={w.label || ""}
                            placeholder="e.g. Main WhatsApp, Sales Desk, VIP Support"
                            onChange={(e) => handleUpdateContact(w.id, { label: e.target.value })}
                            className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-label outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                            Phone Number (With Country Code)
                          </label>
                          <input
                            type="text"
                            value={w.value}
                            placeholder="+380636406783"
                            onChange={(e) => handleUpdateContact(w.id, { value: e.target.value })}
                            className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-label font-mono outline-none transition"
                          />
                        </div>

                        <ContactExtraValuesEditor
                          contact={w}
                          onAddExtra={handleAddExtraValue}
                          onUpdateExtra={handleUpdateExtraValue}
                          onRemoveExtra={handleRemoveExtraValue}
                          placeholder="+380 63 000 0000"
                        />
                      </div>

                      <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-mono truncate max-w-[200px]">
                          {w.href || `https://wa.me/${w.value.replace(/[^0-9]/g, "")}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(`wa-${w.id}`, w.href || `https://wa.me/${w.value.replace(/[^0-9]/g, "")}`)}
                            className="text-muted-foreground hover:text-label inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="size-3" />
                            <span>Copy Link</span>
                          </button>
                          <a
                            href={w.href || `https://wa.me/${w.value.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="size-3" />
                            <span>Open Chat</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TELEGRAM ACCOUNTS SECTION */}
          {(activeCategory === "all" || activeCategory === "telegram") && (
            <div className="surface-lift rounded-2xl bg-card border border-black/8 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-[#26A5E4]/10 flex items-center justify-center text-[#26A5E4]">
                    <TelegramLogo className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                        Telegram Accounts & Channels ({telegrams.length})
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 font-medium">
                        Instant t.me Gateway
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Provide usernames (e.g. @codexdynamics), phone numbers, or channel invite links. Visitors can instantly open chat in Telegram.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddContact("telegram")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#26A5E4] hover:bg-[#1f93cd] text-white text-xs font-semibold transition cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span>Add Telegram</span>
                </button>
              </div>

              {telegrams.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-black/10 rounded-xl">
                  No Telegram accounts configured. Click "Add Telegram" to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {telegrams.map((t, _idx) => (
                    <div
                      key={t.id}
                      className={cn(
                        "rounded-xl border p-4 transition-all relative space-y-3",
                        t.isPrimary
                          ? "border-sky-500/40 bg-sky-500/[0.03] shadow-xs"
                          : "border-black/8 bg-fill/30 hover:border-black/15"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <TelegramLogo className="size-5 shrink-0" />
                          <select
                            value={t.type}
                            onChange={(e) => {
                              const newType = e.target.value as SocialContact["type"];
                              handleUpdateContact(t.id, {
                                type: newType,
                                href: computeHref(newType, t.value),
                              });
                              setHasUnsavedChanges(true);
                              toast.info(`Changed contact type to ${newType}.`);
                            }}
                            className="bg-fill/60 hover:bg-fill border border-black/10 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-label outline-none cursor-pointer"
                            title="Change channel type"
                          >
                            <option value="phone">📞 Phone</option>
                            <option value="whatsapp">💬 WhatsApp</option>
                            <option value="telegram">✈️ Telegram</option>
                            <option value="viber">🟣 Viber</option>
                            <option value="email">✉️ Email</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleSetPrimaryContact(t.id, "telegram")}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer",
                              t.isPrimary
                                ? "bg-[#26A5E4] text-white shadow-xs"
                                : "bg-black/5 dark:bg-white/5 hover:bg-sky-500/10 text-muted-foreground hover:text-sky-600"
                            )}
                          >
                            <Star className={cn("size-2.5", t.isPrimary && "fill-current")} />
                            <span>{t.isPrimary ? "Primary Telegram" : "Make Primary"}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveContact(t.id)}
                          className="size-7 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition cursor-pointer"
                          title="Delete Telegram"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                            Telegram Label
                          </label>
                          <input
                            type="text"
                            value={t.label || ""}
                            placeholder="e.g. Official Telegram, Founder Direct, Agency Channel"
                            onChange={(e) => handleUpdateContact(t.id, { label: e.target.value })}
                            className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-sky-500 rounded-lg px-3 py-1.5 text-xs text-label outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                            Handle, Phone, or URL
                          </label>
                          <input
                            type="text"
                            value={t.value}
                            placeholder="@codexdynamics or +380636406783"
                            onChange={(e) => handleUpdateContact(t.id, { value: e.target.value })}
                            className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-sky-500 rounded-lg px-3 py-1.5 text-xs text-label font-mono outline-none transition"
                          />
                        </div>

                        <ContactExtraValuesEditor
                          contact={t}
                          onAddExtra={handleAddExtraValue}
                          onUpdateExtra={handleUpdateExtraValue}
                          onRemoveExtra={handleRemoveExtraValue}
                          placeholder="@extra_handle or https://t.me/..."
                        />
                      </div>

                      <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-mono truncate max-w-[200px]">
                          {t.href || `https://t.me/${t.value.replace(/^@/, "")}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(`tg-${t.id}`, t.href || `https://t.me/${t.value.replace(/^@/, "")}`)}
                            className="text-muted-foreground hover:text-label inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="size-3" />
                            <span>Copy Link</span>
                          </button>
                          <a
                            href={t.href || `https://t.me/${t.value.replace(/^@/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="size-3" />
                            <span>Open Telegram</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIBER NUMBERS SECTION */}
          {(activeCategory === "all" || activeCategory === "viber") && (
            <div className="surface-lift rounded-2xl bg-card border border-black/8 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-[#7360F2]/10 flex items-center justify-center text-[#7360F2]">
                    <ViberLogo className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                        Viber Messaging Lines ({vibers.length})
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-medium">
                        viber://chat Protocol
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Configure Viber client support numbers with international format. Direct links open native Viber chat.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddContact("viber")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7360F2] hover:bg-[#6250e0] text-white text-xs font-semibold transition cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span>Add Viber Line</span>
                </button>
              </div>

              {vibers.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-black/10 rounded-xl">
                  No Viber lines configured. Click "Add Viber Line" to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vibers.map((v, _idx) => (
                    <div
                      key={v.id}
                      className={cn(
                        "rounded-xl border p-4 transition-all relative space-y-3",
                        v.isPrimary
                          ? "border-purple-500/40 bg-purple-500/[0.03] shadow-xs"
                          : "border-black/8 bg-fill/30 hover:border-black/15"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ViberLogo className="size-5 shrink-0" />
                          <select
                            value={v.type}
                            onChange={(e) => {
                              const newType = e.target.value as SocialContact["type"];
                              handleUpdateContact(v.id, {
                                type: newType,
                                href: computeHref(newType, v.value),
                              });
                              setHasUnsavedChanges(true);
                              toast.info(`Changed contact type to ${newType}.`);
                            }}
                            className="bg-fill/60 hover:bg-fill border border-black/10 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-label outline-none cursor-pointer"
                            title="Change channel type"
                          >
                            <option value="phone">📞 Phone</option>
                            <option value="whatsapp">💬 WhatsApp</option>
                            <option value="telegram">✈️ Telegram</option>
                            <option value="viber">🟣 Viber</option>
                            <option value="email">✉️ Email</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleSetPrimaryContact(v.id, "viber")}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer",
                              v.isPrimary
                                ? "bg-[#7360F2] text-white shadow-xs"
                                : "bg-black/5 dark:bg-white/5 hover:bg-purple-500/10 text-muted-foreground hover:text-purple-600"
                            )}
                          >
                            <Star className={cn("size-2.5", v.isPrimary && "fill-current")} />
                            <span>{v.isPrimary ? "Primary Viber" : "Make Primary"}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveContact(v.id)}
                          className="size-7 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition cursor-pointer"
                          title="Delete Viber"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                            Viber Label
                          </label>
                          <input
                            type="text"
                            value={v.label || ""}
                            placeholder="e.g. Direct Viber, Support Desk"
                            onChange={(e) => handleUpdateContact(v.id, { label: e.target.value })}
                            className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-purple-500 rounded-lg px-3 py-1.5 text-xs text-label outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                            Viber Number (E.164 Format)
                          </label>
                          <input
                            type="text"
                            value={v.value}
                            placeholder="+380636406783"
                            onChange={(e) => handleUpdateContact(v.id, { value: e.target.value })}
                            className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-purple-500 rounded-lg px-3 py-1.5 text-xs text-label font-mono outline-none transition"
                          />
                        </div>

                        <ContactExtraValuesEditor
                          contact={v}
                          onAddExtra={handleAddExtraValue}
                          onUpdateExtra={handleUpdateExtraValue}
                          onRemoveExtra={handleRemoveExtraValue}
                          placeholder="+380 63 000 0000"
                        />
                      </div>

                      <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-mono truncate max-w-[200px]">
                          {v.href || `viber://chat?number=${encodeURIComponent(v.value)}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(`vb-${v.id}`, v.value)}
                            className="text-muted-foreground hover:text-label inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="size-3" />
                            <span>Copy</span>
                          </button>
                          <a
                            href={v.href || `viber://chat?number=${encodeURIComponent(v.value)}`}
                            className="text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="size-3" />
                            <span>Launch Viber</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* OFFICE ADDRESSES & LOCATIONS SECTION */}
          {(activeCategory === "all" || activeCategory === "address") && (
            <div className="surface-lift rounded-2xl bg-card border border-black/8 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                    <MapPin className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                        Office Addresses & Regional Desks ({addresses.length})
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-medium">
                        Google Maps & Directions
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Configure your main headquarters, satellite branches, and regional desks. Visitors can explore them with 1-click Google Maps links.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span>Add Office Location</span>
                </button>
              </div>

              <div className="space-y-4">
                {addresses.map((addr, _idx) => (
                  <div
                    key={addr.id}
                    className={cn(
                      "rounded-xl border p-4 transition-all relative space-y-3",
                      addr.isPrimary
                        ? "border-rose-500/40 bg-rose-500/[0.03] shadow-xs"
                        : "border-black/8 bg-fill/30 hover:border-black/15"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MapsLogo className="size-5 shrink-0" />
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryAddress(addr.id)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer",
                            addr.isPrimary
                              ? "bg-rose-600 text-white shadow-xs"
                              : "bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600"
                          )}
                        >
                          <Star className={cn("size-2.5", addr.isPrimary && "fill-current")} />
                          <span>{addr.isPrimary ? "Primary HQ" : "Set as Primary HQ"}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(addr.fullAddress || `${addr.street}, ${addr.city}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-label text-[11px] font-medium transition"
                        >
                          <ExternalLink className="size-3 text-rose-500" />
                          <span>Preview on Google Maps</span>
                        </a>

                        {addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAddress(addr.id)}
                            className="size-7 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition cursor-pointer"
                            title="Delete address"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                          Location Name / Office Label
                        </label>
                        <input
                          type="text"
                          value={addr.label || ""}
                          placeholder="e.g. Kyiv Office (HQ), Gulliver Tower Desk"
                          onChange={(e) => handleUpdateAddress(addr.id, { label: e.target.value })}
                          className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-rose-500 rounded-lg px-3 py-1.5 text-xs text-label outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                          Street & Building
                        </label>
                        <input
                          type="text"
                          value={addr.street || ""}
                          placeholder="e.g. Sportyvna, 1A"
                          onChange={(e) => handleUpdateAddress(addr.id, { street: e.target.value })}
                          className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-rose-500 rounded-lg px-3 py-1.5 text-xs text-label outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                          City, Postal Code & Country
                        </label>
                        <input
                          type="text"
                          value={addr.city || ""}
                          placeholder="e.g. Kyiv, 012023, Ukraine"
                          onChange={(e) => handleUpdateAddress(addr.id, { city: e.target.value })}
                          className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-rose-500 rounded-lg px-3 py-1.5 text-xs text-label outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                          Full Formatted Address (For Maps Direction Query)
                        </label>
                        <input
                          type="text"
                          value={addr.fullAddress || ""}
                          placeholder="Sportyvna, 1A, Kyiv, 012023, Ukraine"
                          onChange={(e) => handleUpdateAddress(addr.id, { fullAddress: e.target.value })}
                          className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-rose-500 rounded-lg px-3 py-1.5 text-xs text-label outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                          Latitude (Map Pin)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={addr.lat ?? 50.438743}
                          onChange={(e) => handleUpdateAddress(addr.id, { lat: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-rose-500 rounded-lg px-3 py-1.5 text-xs text-label font-mono outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                          Longitude (Map Pin)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={addr.lng ?? 30.523177}
                          onChange={(e) => handleUpdateAddress(addr.id, { lng: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-rose-500 rounded-lg px-3 py-1.5 text-xs text-label font-mono outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMAIL INBOXES SECTION */}
          {(activeCategory === "all" || activeCategory === "email") && (
            <div className="surface-lift rounded-2xl bg-card border border-black/8 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-blue/10 flex items-center justify-center text-blue">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                        Public Inboxes & Routing Emails ({emails.length})
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue/10 text-blue font-medium">
                        mailto: Inboxes
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Configure team emails (e.g. Inquiries, Press, Founder direct). The primary email will also receive client messages.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddContact("email")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue hover:bg-blue-hover text-white text-xs font-semibold transition cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span>Add Email Inbox</span>
                </button>
              </div>

              {emails.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-black/10 rounded-xl">
                  No emails configured. Click "Add Email Inbox" to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {emails.map((em, _idx) => (
                    <div
                      key={em.id}
                      className={cn(
                        "rounded-xl border p-4 transition-all relative space-y-3",
                        em.isPrimary
                          ? "border-blue/40 bg-blue/[0.03] shadow-xs"
                          : "border-black/8 bg-fill/30 hover:border-black/15"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <GmailLogo className="size-5 shrink-0" />
                          <select
                            value={em.type}
                            onChange={(e) => {
                              const newType = e.target.value as SocialContact["type"];
                              handleUpdateContact(em.id, {
                                type: newType,
                                href: computeHref(newType, em.value),
                              });
                              setHasUnsavedChanges(true);
                              toast.info(`Changed contact type to ${newType}.`);
                            }}
                            className="bg-fill/60 hover:bg-fill border border-black/10 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-label outline-none cursor-pointer"
                            title="Change channel type"
                          >
                            <option value="phone">📞 Phone</option>
                            <option value="whatsapp">💬 WhatsApp</option>
                            <option value="telegram">✈️ Telegram</option>
                            <option value="viber">🟣 Viber</option>
                            <option value="email">✉️ Email</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleSetPrimaryContact(em.id, "email")}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer",
                              em.isPrimary
                                ? "bg-blue text-white shadow-xs"
                                : "bg-black/5 dark:bg-white/5 hover:bg-blue/10 text-muted-foreground hover:text-blue"
                            )}
                          >
                            <Star className={cn("size-2.5", em.isPrimary && "fill-current")} />
                            <span>{em.isPrimary ? "Primary Inbox" : "Make Primary"}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveContact(em.id)}
                          className="size-7 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition cursor-pointer"
                          title="Delete Email"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                            Inbox Label / Department
                          </label>
                          <input
                            type="text"
                            value={em.label || ""}
                            placeholder="e.g. Primary Inquiries, Press & Media, Founder Direct"
                            onChange={(e) => handleUpdateContact(em.id, { label: e.target.value })}
                            className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-blue rounded-lg px-3 py-1.5 text-xs text-label outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-subtle mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={em.value}
                            placeholder="contact@codexdynamics.com"
                            onChange={(e) => handleUpdateContact(em.id, { value: e.target.value })}
                            className="w-full bg-white dark:bg-black/20 border border-black/8 focus:border-blue rounded-lg px-3 py-1.5 text-xs text-label font-mono outline-none transition"
                          />
                        </div>

                        <ContactExtraValuesEditor
                          contact={em}
                          onAddExtra={handleAddExtraValue}
                          onUpdateExtra={handleUpdateExtraValue}
                          onRemoveExtra={handleRemoveExtraValue}
                          placeholder="alternate-inbox@codexdynamics.com"
                        />
                      </div>

                      <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-mono truncate max-w-[200px]">
                          {em.href || `mailto:${em.value}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(`em-${em.id}`, em.value)}
                            className="text-muted-foreground hover:text-label inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="size-3" />
                            <span>Copy</span>
                          </button>
                          <a
                            href={em.href || `mailto:${em.value}`}
                            className="text-blue hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="size-3" />
                            <span>Send Email</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HEADER SOCIAL BUTTONS CARD */}
          {(activeCategory === "all" || activeCategory === "header_socials") && (
            <div className="surface-lift rounded-2xl bg-card border border-black/8 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-blue/10 flex items-center justify-center text-blue">
                      <Share2 className="size-4" />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                      Header Social Action Buttons (Show / Hide & Credentials)
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {activeCount} of 5 Active on Header
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 max-w-2xl">
                    Toggle which social icons appear in the global website navigation header, and update their destination profile links.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleEnableAllSocials}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-fill text-xs font-medium text-label transition cursor-pointer"
                  >
                    <Eye className="size-3 text-emerald-600" />
                    <span>Show All 5</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisableAllSocials}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-fill text-xs font-medium text-label transition cursor-pointer"
                  >
                    <EyeOff className="size-3 text-rose-500" />
                    <span>Hide All</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSocialUrls}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-fill text-xs font-medium text-subtle hover:text-label transition cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset URLs</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const state = headerSocials[platform.key];
                  const Logo = platform.logo;
                  const isCopied = copiedKey === platform.key;

                  return (
                    <div
                      key={platform.key}
                      className={cn(
                        "rounded-xl border p-4 transition-all relative flex flex-col justify-between space-y-3",
                        state.enabled
                          ? "border-black/12 bg-fill/40 shadow-xs"
                          : "border-black/5 bg-fill/10 opacity-70"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "size-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform",
                              platform.bgClass
                            )}
                          >
                            <Logo className={platform.logoClass} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-label">
                                {platform.name}
                              </span>
                              {state.enabled && (
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {platform.description}
                            </p>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={state.enabled}
                            onChange={() => handleToggleSocial(platform.key)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-black/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="font-medium text-subtle flex items-center gap-1">
                            <LinkIcon className="size-3" />
                            <span>Destination URL</span>
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopyUrl(platform.key, state.url)}
                              className="text-[10px] text-muted-foreground hover:text-label transition px-1.5 py-0.5 rounded hover:bg-black/5 flex items-center gap-1 cursor-pointer"
                              title="Copy URL"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="size-2.5 text-emerald-600" />
                                  <span className="text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="size-2.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                            {state.url && (
                              <a
                                href={state.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue hover:underline px-1.5 py-0.5 rounded hover:bg-blue/5 flex items-center gap-0.5"
                                title="Open URL in new tab"
                              >
                                <ExternalLink className="size-2.5" />
                                <span>Test</span>
                              </a>
                            )}
                          </div>
                        </div>

                        <input
                          type="url"
                          value={state.url}
                          placeholder={platform.placeholder}
                          onChange={(e) => handleUpdateSocialUrl(platform.key, e.target.value)}
                          className={cn(
                            "w-full bg-white dark:bg-black/20 border rounded-lg px-3 py-1.5 text-xs text-label outline-none transition font-mono",
                            state.enabled
                              ? "border-black/10 focus:border-blue"
                              : "border-black/5 text-muted-foreground bg-fill/50"
                          )}
                        />
                      </div>

                      <div className="pt-2 border-t border-hairline flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Status: {state.enabled ? "Live on Header" : "Hidden"}</span>
                        <span className="font-mono">
                          {state.url ? new URL(state.url).hostname : "No URL"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BRAND & HERO COPY SECTION */}
          {(activeCategory === "all" || activeCategory === "brand") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Settings */}
              <div className="surface-lift rounded-2xl bg-card border border-black/8 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-hairline">
                  <Sparkles className="size-4 text-blue" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                    Brand & Global Settings
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
                      Brand / Company Name
                    </label>
                    <input
                      type="text"
                      value={form.siteName}
                      onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                      className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2 text-xs text-label outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
                      Copyright Year
                    </label>
                    <input
                      type="text"
                      value={form.copyrightYear}
                      onChange={(e) => setForm({ ...form, copyrightYear: e.target.value })}
                      className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2 text-xs text-label outline-none transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
                      Inbound Inquiries Dispatch Email
                    </label>
                    <input
                      type="email"
                      value={form.formSubmitEmail}
                      onChange={(e) => setForm({ ...form, formSubmitEmail: e.target.value })}
                      className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2 text-xs text-label outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Section Copy */}
              <div className="surface-lift rounded-2xl bg-card border border-black/8 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-hairline">
                  <Sparkles className="size-4 text-purple-600" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                    Hero Section Copy
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
                      Hero Pill Badge
                    </label>
                    <input
                      type="text"
                      value={form.heroBadge}
                      onChange={(e) => setForm({ ...form, heroBadge: e.target.value })}
                      className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2 text-xs text-label outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
                      Main Headline (Title)
                    </label>
                    <input
                      type="text"
                      value={form.heroTitle}
                      onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                      className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl px-3.5 py-2 text-xs text-label outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-subtle mb-1">
                      Hero Subtitle / Value Proposition
                    </label>
                    <textarea
                      rows={2}
                      value={form.heroSubtitle}
                      onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                      className="w-full bg-fill/60 hover:bg-fill border border-black/8 focus:border-blue focus:bg-white rounded-xl p-3 text-xs text-label outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating Save Bar */}
          <div className="surface-lift rounded-2xl bg-card border border-black/8 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>
                All changes made here are saved directly into your SQLite database and immediately active on the live site.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/10 hover:bg-fill text-muted-foreground hover:text-label text-xs font-medium transition cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-blue hover:bg-blue-hover text-paper text-xs font-semibold transition shadow-sm active:scale-[0.99] cursor-pointer"
              >
                <Save className="size-3.5" />
                <span>{saving ? "Saving Changes..." : "Save All Contacts & Content"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
