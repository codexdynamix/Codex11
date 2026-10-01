import { useState, useRef, useEffect } from "react";
import {
  Shield,
  KeyRound,
  BellRing,
  Send,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  Database,
  RefreshCw,
  ExternalLink,
  Laptop,
  Palette,
  Layout,
  Megaphone,
  Globe,
  AlertTriangle,
  Save,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { CrmStats } from "@/types/crm";
import type { SiteConfig } from "@/types/site-editor";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { persistSiteConfig } from "@/lib/theme-engine";

import { LayoutSettingsSection } from "./settings/LayoutSettingsSection";
import { ConversionSettingsSection } from "./settings/ConversionSettingsSection";
import { SeoSettingsSection } from "./settings/SeoSettingsSection";
import { EmergencySettingsSection } from "./settings/EmergencySettingsSection";

interface SettingsTabProps {
  stats: CrmStats;
  webhookUrl: string;
  onSaveWebhook: (url: string) => Promise<void>;
  onTestWebhook: (url: string) => Promise<{ ok: boolean; message: string }>;
  onChangePassword: (currentPass: string, newPass: string) => Promise<{ ok: boolean; message?: string; error?: string }>;
  onOpenHostingerModal: () => void;
  onRestoreBackup?: (backupData: any) => Promise<boolean>;
  fullData: any;
  defaultSubTab?: SubTabId;
  onSubTabChange?: (subTab: SubTabId) => void;
}

type SubTabId = "layout" | "conversion" | "seo" | "emergency" | "system";

export function SettingsTab({
  stats: _stats,
  webhookUrl: initialWebhook,
  onSaveWebhook,
  onTestWebhook,
  onChangePassword,
  onOpenHostingerModal,
  onRestoreBackup,
  fullData,
  defaultSubTab,
  onSubTabChange,
}: SettingsTabProps) {
  const { config: globalConfig, updateLocalConfig } = useSiteConfig();
  const [localConfig, setLocalConfig] = useState<SiteConfig>(globalConfig);
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>(defaultSubTab || "layout");
  const [savingConfig, setSavingConfig] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync subtab when defaultSubTab changes from external navigation
  useEffect(() => {
    if (defaultSubTab) {
      setActiveSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);

  // Sync from global config on mount
  useEffect(() => {
    setLocalConfig(globalConfig);
  }, [globalConfig]);

  const handleConfigChange = (updated: SiteConfig) => {
    setLocalConfig(updated);
    setHasUnsavedChanges(true);
  };

  const handleSaveAllConfig = async () => {
    setSavingConfig(true);
    try {
      updateLocalConfig(localConfig);
      const res = await persistSiteConfig(localConfig);
      if (res.ok) {
        setHasUnsavedChanges(false);
        toast.success("Site configuration published successfully to SQLite!");
      } else {
        toast.error(res.error || "Failed to persist configuration.");
      }
    } catch (e) {
      toast.error(String(e));
    } finally {
      setSavingConfig(false);
    }
  };

  const handleResetConfig = () => {
    setLocalConfig(globalConfig);
    setHasUnsavedChanges(false);
    toast.info("Reverted unsaved changes to active site configuration.");
  };

  // --- Existing System & Credentials State ---
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [webhook, setWebhook] = useState(initialWebhook || "");
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookMsg, setWebhookMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    setPassLoading(true);
    try {
      const res = await onChangePassword(currentPassword, newPassword);
      if (res.ok) {
        setPassMsg({ type: "success", text: res.message || "Password updated successfully in SQLite database." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPassMsg({ type: "error", text: res.error || "Failed to update password." });
      }
    } catch (err) {
      setPassMsg({ type: "error", text: String(err) });
    } finally {
      setPassLoading(false);
    }
  };

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookMsg(null);
    setWebhookLoading(true);
    try {
      await onSaveWebhook(webhook);
      setWebhookMsg({ type: "success", text: "Webhook URL saved successfully." });
    } catch (err) {
      setWebhookMsg({ type: "error", text: String(err) });
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhook.trim()) {
      setWebhookMsg({ type: "error", text: "Please enter a webhook URL first." });
      return;
    }
    setTestLoading(true);
    setWebhookMsg(null);
    try {
      const res = await onTestWebhook(webhook);
      setWebhookMsg({
        type: res.ok ? "success" : "error",
        text: res.message || (res.ok ? "Test ping dispatched successfully!" : "Webhook test failed."),
      });
    } catch (err) {
      setWebhookMsg({ type: "error", text: String(err) });
    } finally {
      setTestLoading(false);
    }
  };

  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(fullData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `codex_crm_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setRestoring(true);
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid backup JSON structure.");
      }

      if (
        !window.confirm(
          "Are you sure you want to restore the SQLite database from this backup file? Existing records with matching IDs will be restored."
        )
      ) {
        return;
      }

      if (onRestoreBackup) {
        const ok = await onRestoreBackup(parsed);
        if (ok) {
          toast.success("Database restored successfully from backup.");
        }
      } else {
        toast.error("Restore handler not configured.");
      }
    } catch (err: any) {
      toast.error(`Restore failed: ${err.message || String(err)}`);
    } finally {
      setRestoring(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const SUB_TABS: { id: SubTabId; label: string; icon: any; badge?: string }[] = [
    { id: "layout", label: "Layout & Sections", icon: Layout },
    { id: "conversion", label: "Conversion Tools", icon: Megaphone },
    { id: "seo", label: "SEO & Social Suite", icon: Globe },
    { id: "emergency", label: "Emergency & Snapshots", icon: AlertTriangle, badge: localConfig.emergency?.maintenanceMode ? "ACTIVE" : undefined },
    { id: "system", label: "Security & Database", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls Header & Action Bar */}
      <div className="surface-lift rounded-2xl bg-card border border-black/8 p-5 shadow-[0_0_0_1px_rgb(0_0_0_/_0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-blue" />
              <h2 className="text-lg font-bold text-label font-display tracking-tight">
                Site Customizer & Architecture
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Full control over visual branding, section order, conversion docks, search metadata, and emergency systems.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleResetConfig}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-semibold text-label transition cursor-pointer shadow-2xs"
              >
                <RotateCcw className="size-3.5 text-subtle" />
                Discard
              </button>
            )}

            <button
              type="button"
              disabled={savingConfig}
              onClick={handleSaveAllConfig}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs ${
                hasUnsavedChanges
                  ? "bg-blue hover:bg-blue-600 text-white animate-pulse"
                  : "bg-black/90 hover:bg-black text-white"
              }`}
            >
              {savingConfig ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              <span>{savingConfig ? "Publishing..." : hasUnsavedChanges ? "Save & Publish Changes *" : "Saved to SQLite"}</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-semibold text-label transition cursor-pointer shadow-2xs"
              title="Open public website in new tab"
            >
              <ExternalLink className="size-3.5 text-subtle" />
              <span>Preview</span>
            </a>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-hairline scrollbar-none">
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveSubTab(tab.id);
                  onSubTabChange?.(tab.id);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  isActive
                    ? "bg-blue/10 border-blue/30 text-blue shadow-2xs"
                    : "border-transparent text-subtle hover:text-label hover:bg-black/5"
                }`}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-600 text-white uppercase animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Settings Section */}
      {activeSubTab === "layout" && (
        <LayoutSettingsSection config={localConfig} onChange={handleConfigChange} />
      )}

      {activeSubTab === "conversion" && (
        <ConversionSettingsSection config={localConfig} onChange={handleConfigChange} />
      )}

      {activeSubTab === "seo" && (
        <SeoSettingsSection config={localConfig} onChange={handleConfigChange} />
      )}

      {activeSubTab === "emergency" && (
        <EmergencySettingsSection config={localConfig} onChange={handleConfigChange} />
      )}

      {activeSubTab === "system" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin Password Settings */}
            <div className="surface-lift rounded-2xl bg-card border border-black/8 p-6 shadow-[0_0_0_1px_rgb(0_0_0_/_0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-hairline mb-5">
                  <div className="flex items-center gap-2">
                    <KeyRound className="size-4 text-blue" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                      Admin Credentials
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-subtle">
                    admin@codexdynamics.com
                  </span>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-label mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password (default: Admin123!)"
                      className="w-full text-xs rounded-xl border border-black/10 bg-fill/40 px-3.5 py-2.5 text-label placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-label mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 chars)"
                      className="w-full text-xs rounded-xl border border-black/10 bg-fill/40 px-3.5 py-2.5 text-label placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-label mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full text-xs rounded-xl border border-black/10 bg-fill/40 px-3.5 py-2.5 text-label placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition"
                    />
                  </div>

                  {passMsg && (
                    <div
                      className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                        passMsg.type === "success"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                      }`}
                    >
                      {passMsg.type === "success" ? (
                        <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      )}
                      <span>{passMsg.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={passLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-label text-surface px-4 py-2.5 text-xs font-medium hover:bg-label/90 transition cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {passLoading && <RefreshCw className="size-3.5 animate-spin" />}
                    <span>{passLoading ? "Updating Database..." : "Update SQLite Password"}</span>
                  </button>
                </form>
              </div>

              <div className="pt-4 mt-6 border-t border-hairline text-[11px] text-subtle">
                Securely encrypted via SHA-256 + cryptographic salt in local SQLite.
              </div>
            </div>

            {/* Webhook Settings */}
            <div className="surface-lift rounded-2xl bg-card border border-black/8 p-6 shadow-[0_0_0_1px_rgb(0_0_0_/_0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-hairline mb-5">
                  <div className="flex items-center gap-2">
                    <BellRing className="size-4 text-emerald-600" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                      Lead Dispatch Webhook
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-subtle">
                    HTTP POST Payload
                  </span>
                </div>

                <form onSubmit={handleSaveWebhook} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-label mb-1">
                      Endpoint URL
                    </label>
                    <input
                      type="url"
                      value={webhook}
                      onChange={(e) => setWebhook(e.target.value)}
                      placeholder="https://n8n.yourdomain.com/webhook/leads"
                      className="w-full text-xs font-mono rounded-xl border border-black/10 bg-fill/40 px-3.5 py-2.5 text-label placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    />
                    <p className="text-[11px] text-subtle mt-1.5">
                      Sends real-time JSON payloads for new client inquiries directly to Slack, Discord, Zapier or n8n.
                    </p>
                  </div>

                  {webhookMsg && (
                    <div
                      className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                        webhookMsg.type === "success"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                      }`}
                    >
                      {webhookMsg.type === "success" ? (
                        <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      )}
                      <span>{webhookMsg.text}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={webhookLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-label text-surface px-4 py-2.5 text-xs font-medium hover:bg-label/90 transition cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {webhookLoading && <RefreshCw className="size-3.5 animate-spin" />}
                      <span>Save Webhook</span>
                    </button>

                    <button
                      type="button"
                      disabled={testLoading || !webhook.trim()}
                      onClick={handleTestWebhook}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-fill/50 hover:bg-fill px-4 py-2.5 text-xs font-medium text-label transition cursor-pointer disabled:opacity-50"
                    >
                      {testLoading ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5 text-emerald-600" />
                      )}
                      <span>Test Ping</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="pt-4 mt-6 border-t border-hairline text-[11px] text-subtle flex items-center justify-between">
                <span>Status: {initialWebhook ? "Configured" : "Inactive"}</span>
                <span className="font-mono">JSON format</span>
              </div>
            </div>

            {/* Public Site Sync Telemetry */}
            <div className="surface-lift rounded-2xl bg-card border border-black/8 p-6 shadow-[0_0_0_1px_rgb(0_0_0_/_0.04)]">
              <div className="flex items-center justify-between pb-3 border-b border-hairline mb-4">
                <div className="flex items-center gap-2">
                  <Laptop className="size-4 text-purple-600" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                    Live Public Synchronization
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Reactive Engine
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Changes saved in the Site Customizer are stored directly in SQLite and immediately reflected across the public React frontend.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-fill/50 border border-black/5">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-label">Branding & Theme Engine</span>
                  </div>
                  <span className="text-subtle font-mono">SQLite settings</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-fill/50 border border-black/5">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-label">Lead Capture Funnel</span>
                  </div>
                  <span className="text-subtle font-mono">Direct to SQLite</span>
                </div>
              </div>
            </div>

            {/* Database & Production Export */}
            <div className="surface-lift rounded-2xl bg-card border border-black/8 p-6 shadow-[0_0_0_1px_rgb(0_0_0_/_0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-hairline mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="size-4 text-amber-600" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-label">
                      Database & Deployment
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-subtle">
                    database.sqlite
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  Export complete backups or review Hostinger PHP SQLite deployment instructions for production migration.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-black/10 bg-fill/50 hover:bg-fill text-label transition text-xs font-medium group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="size-4 text-blue group-hover:translate-y-0.5 transition" />
                      <span>Download Full CRM Backup (JSON)</span>
                    </div>
                    <span className="text-[11px] text-subtle font-mono">Instant Export</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <button
                    type="button"
                    disabled={restoring}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-black/10 bg-fill/50 hover:bg-fill text-label transition text-xs font-medium group cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2.5">
                      {restoring ? (
                        <RefreshCw className="size-4 text-blue animate-spin" />
                      ) : (
                        <Upload className="size-4 text-blue group-hover:-translate-y-0.5 transition" />
                      )}
                      <span>{restoring ? "Restoring Database..." : "Restore Database from JSON Backup"}</span>
                    </div>
                    <span className="text-[11px] text-subtle font-mono">Import File</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenHostingerModal}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-black/10 bg-fill/50 hover:bg-fill text-label transition text-xs font-medium group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ExternalLink className="size-4 text-purple-600 group-hover:rotate-12 transition" />
                      <span>Hostinger & PHP Sync Architecture</span>
                    </div>
                    <span className="text-[11px] text-subtle font-mono">View Docs</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-hairline text-[11px] text-subtle">
                Zero external vendor lock-in; lightweight SQLite portable engine.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
