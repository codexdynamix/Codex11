import { useState } from "react";
import { AlertTriangle, History, Code2, RotateCcw, Trash2, Camera, ShieldAlert } from "lucide-react";
import type { SiteConfig, ConfigSnapshot } from "@/types/site-editor";
import { toast } from "sonner";

interface EmergencySettingsSectionProps {
  config: SiteConfig;
  onChange: (updated: SiteConfig) => void;
}

export function EmergencySettingsSection({ config, onChange }: EmergencySettingsSectionProps) {
  const [snapshotLabel, setSnapshotLabel] = useState("");

  const emergency = config.emergency || {
    maintenanceMode: false,
    headline: "Scheduled Platform Upgrade",
    message: "Codex Dynamics is deploying precision performance enhancements. We will be back online shortly.",
    estimatedReturn: "",
    emergencyContact: "ops@codexdynamics.com",
  };

  const codeInjection = config.codeInjection || {
    headerCode: "",
    footerCode: "",
  };

  const snapshots: ConfigSnapshot[] = config.snapshots || [];

  const handleTakeSnapshot = () => {
    const label = snapshotLabel.trim() || `Snapshot ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newSnapshot: ConfigSnapshot = {
      id: "snap-" + Date.now(),
      name: label,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      config: JSON.parse(JSON.stringify(config)),
    };

    onChange({
      ...config,
      snapshots: [newSnapshot, ...snapshots],
    });

    setSnapshotLabel("");
    toast.success(`Snapshot "${label}" created successfully!`);
  };

  const handleRestoreSnapshot = (snap: ConfigSnapshot) => {
    const timeStr = snap.createdAt || snap.timestamp;
    if (!window.confirm(`Restore configuration snapshot "${snap.name}" from ${new Date(timeStr).toLocaleString()}?`)) {
      return;
    }

    onChange({
      ...config,
      ...snap.config,
      snapshots, // preserve existing snapshot history
    } as any);

    toast.success(`Restored configuration to "${snap.name}". Click 'Save Changes' to publish.`);
  };

  const handleDeleteSnapshot = (id: string) => {
    onChange({
      ...config,
      snapshots: snapshots.filter((s) => s.id !== id),
    });
    toast.success("Snapshot removed.");
  };

  return (
    <div className="space-y-8">
      {/* 1. Emergency Mode & Maintenance Screen */}
      <div className="rounded-2xl border border-hairline bg-surface-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${emergency.maintenanceMode ? "bg-red-500/20 text-red-600 animate-pulse" : "bg-amber-500/10 text-amber-600"}`}>
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-label">Emergency Mode & Maintenance Screen</h3>
              <p className="text-xs text-subtle">
                Immediately switches the public site to an elegant high-tech maintenance / upgrade screen.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
            <input
              type="checkbox"
              checked={emergency.maintenanceMode}
              onChange={(e) =>
                onChange({
                  ...config,
                  emergency: { ...emergency, maintenanceMode: e.target.checked },
                })
              }
              className="size-4 accent-red-600 rounded cursor-pointer"
            />
            <span className={`text-xs font-bold ${emergency.maintenanceMode ? "text-red-600" : "text-label"}`}>
              {emergency.maintenanceMode ? "MAINTENANCE ACTIVE" : "Public Site Normal"}
            </span>
          </label>
        </div>

        {emergency.maintenanceMode && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-800 text-xs flex items-center gap-3">
            <AlertTriangle className="size-4 shrink-0 text-red-600" />
            <span>
              <strong>Warning:</strong> The public site is currently displaying the maintenance screen. Admins still have full access to this control portal.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-label mb-1">Headline Text</label>
            <input
              type="text"
              value={emergency.headline || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  emergency: { ...emergency, headline: e.target.value },
                })
              }
              placeholder="e.g. Scheduled Platform Upgrade"
              className="w-full text-xs px-3 py-2 rounded-lg border border-black/10 bg-white text-label"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-label mb-1">Public Explanation Message</label>
            <textarea
              rows={2}
              value={emergency.message || emergency.subtext || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  emergency: {
                    ...emergency,
                    message: e.target.value,
                    subtext: e.target.value,
                  },
                })
              }
              placeholder="Detailed explanation displayed to visitors..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-black/10 bg-white text-label resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-label mb-1">Estimated Return Date / Time</label>
            <input
              type="text"
              value={emergency.estimatedReturn || emergency.estimatedLaunch || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  emergency: {
                    ...emergency,
                    estimatedReturn: e.target.value,
                    estimatedLaunch: e.target.value,
                  },
                })
              }
              placeholder="e.g. 2026-10-01 14:00 UTC or 'In 2 hours'"
              className="w-full text-xs px-3 py-2 rounded-lg border border-black/10 bg-white text-label font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-label mb-1">Emergency Operations Email / Contact</label>
            <input
              type="text"
              value={emergency.emergencyContact || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  emergency: { ...emergency, emergencyContact: e.target.value },
                })
              }
              placeholder="ops@codexdynamics.com"
              className="w-full text-xs px-3 py-2 rounded-lg border border-black/10 bg-white text-label"
            />
          </div>
        </div>
      </div>

      {/* 2. 1-Click Configuration Snapshots & Restore */}
      <div className="rounded-2xl border border-hairline bg-surface-card p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue/10 text-blue">
            <History className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-label">1-Click Configuration Snapshots & Restore</h3>
            <p className="text-xs text-subtle">
              Create instant backup checkpoints before major redesigns. Revert safely in one click.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 mb-6">
          <input
            type="text"
            value={snapshotLabel}
            onChange={(e) => setSnapshotLabel(e.target.value)}
            placeholder="Snapshot name (e.g. 'Before Autumn Campaign Overhaul')..."
            className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-black/10 bg-white text-label"
          />
          <button
            type="button"
            onClick={handleTakeSnapshot}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue text-white text-xs font-semibold hover:bg-blue-600 transition cursor-pointer shadow-xs shrink-0"
          >
            <Camera className="size-4" />
            Capture Snapshot
          </button>
        </div>

        {snapshots.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-black/15 text-center bg-black/[0.01]">
            <p className="text-xs text-subtle">No snapshots saved yet. Capture a snapshot above before making changes.</p>
          </div>
        ) : (
          <div className="divide-y divide-hairline border border-hairline rounded-xl overflow-hidden bg-white/70">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-black/[0.01]"
              >
                <div>
                  <h4 className="text-xs font-bold text-label">{snap.name}</h4>
                  <span className="text-[10px] text-subtle font-mono">
                    {new Date(snap.createdAt || snap.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleRestoreSnapshot(snap)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-xs font-medium text-label transition cursor-pointer border border-black/10"
                  >
                    <RotateCcw className="size-3.5" />
                    Restore
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSnapshot(snap.id)}
                    className="p-1.5 rounded-lg text-subtle hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Delete snapshot"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Custom Code Injection Engine */}
      <div className="rounded-2xl border border-hairline bg-surface-card p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
            <Code2 className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-label">Custom HTML & CSS Code Injection Engine</h3>
            <p className="text-xs text-subtle">
              Safely inject custom CSS styles, web fonts, tracking snippets or chat widgets into the DOM canvas.
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-label mb-1">
              Header Injection Code (&lt;head&gt; tags, custom &lt;style&gt;, external font links)
            </label>
            <textarea
              rows={4}
              value={codeInjection.headerCode || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  codeInjection: { ...codeInjection, headerCode: e.target.value },
                })
              }
              placeholder="<style> /* custom styling overrides */ </style>"
              className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-black/10 bg-white text-label resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-label mb-1">
              Footer Injection Code (&lt;body&gt; bottom tags, third-party chat widgets)
            </label>
            <textarea
              rows={4}
              value={codeInjection.footerCode || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  codeInjection: { ...codeInjection, footerCode: e.target.value },
                })
              }
              placeholder="<!-- Third-party widget embed -->"
              className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-black/10 bg-white text-label resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
