import { X, ShieldCheck, Database, CheckCircle2, Copy, Check, Download, ArrowDownToLine, Loader2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface HostingerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HostingerModal({ isOpen, onClose }: HostingerModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const copyPath = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    toast.info("Downloading Hostinger package (35.4 MB)...");
    try {
      const res = await fetch("/api/download-hostinger-zip");
      if (!res.ok) throw new Error("Server returned error: " + res.status);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "hostinger-public_html.zip";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 2000);
      toast.success("Download started successfully!");
    } catch (err) {
      console.error("Blob download failed, falling back to direct window open:", err);
      // Fallback directly opens in new tab with download headers
      window.open("/api/download-hostinger-zip", "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl surface-lift rounded-3xl bg-card border border-black/8 p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue/10 text-blue">
              <Database className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-label font-display">
                Hostinger 1-Click Deployment Package
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ready to extract directly into Hostinger public_html
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 1-Click Download Hero Banner */}
        <div className="p-4 rounded-2xl bg-blue/10 border border-blue/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue">
              <Download className="size-4" />
              <span>Hostinger public_html ZIP (35.4 MB)</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Contains pre-rendered index.html, .htaccess, all assets, PHP CRM APIs &amp; SQLite database.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue hover:bg-blue-hover text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-75"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="size-4" />
                  <span>Download ZIP</span>
                </>
              )}
            </button>
            <a
              href="/api/download-hostinger-zip"
              target="_blank"
              rel="noopener noreferrer"
              download="hostinger-public_html.zip"
              title="Open direct download link in new tab"
              className="p-2.5 rounded-xl bg-white hover:bg-fill-elevated text-label border border-black/8 shadow-xs transition-colors cursor-pointer"
            >
              <ExternalLink className="size-4 text-muted-foreground" />
            </a>
          </div>
        </div>

        <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
          <div className="p-4 rounded-2xl bg-fill-subtle/70 border border-hairline space-y-2">
            <div className="flex items-center gap-2 text-label font-semibold">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>How to Deploy on Hostinger (Takes 60 Seconds):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-muted-foreground">
              <li>Open your Hostinger hPanel &rarr; <b>Websites</b> &rarr; <b>File Manager</b>.</li>
              <li>Navigate into the <code className="font-mono text-label bg-fill px-1 py-0.5 rounded">public_html</code> folder.</li>
              <li>Upload <code className="font-mono text-label bg-fill px-1 py-0.5 rounded">hostinger-public_html.zip</code> and click <b>Extract</b> directly into <code className="font-mono text-label bg-fill px-1 py-0.5 rounded">public_html</code>.</li>
              <li>Done! Your site, CRM, and APIs are live instantly with zero terminal commands needed.</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-label uppercase tracking-wider text-[11px]">
              Hostinger Feature Support:
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-label">1. Apache &amp; LiteSpeed Ready:</span>
                  <p className="text-[11px]">
                    Includes pre-configured <code className="font-mono text-label">.htaccess</code> for Single Page App routing, gzip compression, and cache controls.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-label">2. Pre-Seeded SQLite Database:</span>
                  <p className="text-[11px]">
                    Includes all existing projects, custom categories, media uploads, reviews, and admin login (<code className="font-mono text-label">admin@codexdynamics.com</code> / <code className="font-mono text-label">Admin123!</code>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-label">3. Native PHP Endpoints:</span>
                  <p className="text-[11px]">
                    All actions route through native PHP PDO scripts in <code className="font-mono text-label">/api/</code> without requiring Node.js on your server.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-fill border border-black/8 rounded-xl flex items-center justify-between font-mono text-[11px] text-label">
            <span>Database File: ./database.sqlite</span>
            <button
              type="button"
              onClick={() => copyPath("database.sqlite")}
              className="inline-flex items-center gap-1 text-blue hover:underline cursor-pointer"
            >
              {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-black/[0.06] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-medium cursor-pointer shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
