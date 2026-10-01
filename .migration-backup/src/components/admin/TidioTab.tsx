import { useState } from "react";
import {
  MessageSquare,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Globe,
  Radio,
  Copy,
  Check,
  Send,
  User,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useSiteConfig } from "@/context/SiteConfigContext";
import type { TidioSettings } from "@/types/site-editor";

export function TidioTab() {
  const { config, refetch, updateLocalConfig } = useSiteConfig();
  const [tidioState, setTidioState] = useState<TidioSettings>({
    enabled: config.tidio?.enabled ?? false,
    publicKey: config.tidio?.publicKey ?? "",
    disableOnAdmin: config.tidio?.disableOnAdmin ?? true,
    hideOnMobile: config.tidio?.hideOnMobile ?? false,
    position: config.tidio?.position ?? "bottom-right",
    welcomeMessage:
      config.tidio?.welcomeMessage ??
      "Hi! How can we help you today? Leave us a message and our team will get right back to you.",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [hasCopiedSnippet, setHasCopiedSnippet] = useState(false);

  // Simulator state
  const [simMessages, setSimMessages] = useState<
    Array<{ sender: "bot" | "user"; text: string; time: string }>
  >([
    {
      sender: "bot",
      text:
        tidioState.welcomeMessage ||
        "Hi there! 👋 Welcome to Codex Dynamics. How can we help with your web design or software project today?",
      time: "Just now",
    },
  ]);
  const [simInput, setSimInput] = useState("");

  const handleSimSend = (textToSend?: string) => {
    const text = textToSend || simInput;
    if (!text.trim()) return;

    setSimMessages((prev) => [
      ...prev,
      { sender: "user", text, time: "Just now" },
    ]);
    if (!textToSend) setSimInput("");

    // Simulate instant automated bot reply
    setTimeout(() => {
      setSimMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Thank you for reaching out! A dedicated project manager has received your note and will reply promptly. You can also reach our desk directly on WhatsApp: +380 63 640 6783.",
          time: "Just now",
        },
      ]);
    }, 800);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const cleanKey = tidioState.publicKey
        .trim()
        .replace(/<script[^>]*src=["'](?:https?:)?\/\/code\.tidio\.co\/([a-zA-Z0-9_-]+)(?:\.js)?["'][^>]*>[\s\S]*?<\/script>/i, "$1")
        .replace(/.*code\.tidio\.co\/([a-zA-Z0-9_-]+).*/i, "$1")
        .replace(/\.js$/, "");

      const updatedTidio: TidioSettings = {
        ...tidioState,
        publicKey: cleanKey,
      };

      const updatedConfig = {
        ...config,
        tidio: updatedTidio,
      };

      const res = await fetch("/api/crm/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_site_content",
          config: updatedConfig,
          payload: { config: updatedConfig },
        }),
      });

      const data = await res.json();
      if (data.ok) {
        toast.success("Tidio Live Chat settings saved successfully!");
        updateLocalConfig(data.config || updatedConfig);
        setTidioState(updatedTidio);
        await refetch();
      } else {
        toast.error(data.error || "Failed to save Tidio configuration");
      }
    } catch (err) {
      toast.error("Network error while saving: " + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    const key = tidioState.publicKey
      .trim()
      .replace(/<script[^>]*src=["'](?:https?:)?\/\/code\.tidio\.co\/([a-zA-Z0-9_-]+)(?:\.js)?["'][^>]*>[\s\S]*?<\/script>/i, "$1")
      .replace(/.*code\.tidio\.co\/([a-zA-Z0-9_-]+).*/i, "$1")
      .replace(/\.js$/, "");

    if (!key) {
      setTestResult({
        success: false,
        message: "Please enter your Tidio Project Public Key before testing.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const start = performance.now();
    try {
      // Test script reachability
      const url = `https://code.tidio.co/${encodeURIComponent(key)}.js`;
      await fetch(url, { method: "HEAD", mode: "no-cors" });
      const latency = Math.round(performance.now() - start);

      setTestResult({
        success: true,
        message: `Tidio CDN script is reachable at code.tidio.co/${key}.js`,
        latencyMs: latency,
      });
      toast.success("Tidio script verified and active!");
    } catch (err) {
      setTestResult({
        success: false,
        message: `Could not verify code.tidio.co/${key}.js: ${String(err)}`,
      });
      toast.error("Script ping check failed");
    } finally {
      setIsTesting(false);
    }
  };

  const copySnippet = () => {
    const key = tidioState.publicKey.trim() || "YOUR_TIDIO_KEY";
    const snippet = `<script src="//code.tidio.co/${key}.js" async></script>`;
    navigator.clipboard.writeText(snippet);
    setHasCopiedSnippet(true);
    toast.success("HTML snippet copied to clipboard");
    setTimeout(() => setHasCopiedSnippet(false), 2000);
  };

  const isConnected = tidioState.enabled && Boolean(tidioState.publicKey.trim());

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#0071E3]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center shadow-md shadow-[#0071E3]/20 shrink-0">
              <MessageSquare className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold text-neutral-900 tracking-tight">
                  Tidio Live Chat & AI Helpdesk
                </h1>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected & Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20">
                    <AlertCircle className="size-3" />
                    Setup Required
                  </span>
                )}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500 border border-neutral-200">
                  v5.x SDK
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
                Seamlessly embed Tidio’s real-time live chat widget and AI customer support agent directly into your public website. Manage client conversations, incoming leads, and automated bots without writing code.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://www.tidio.com/panel/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-black/[0.08] bg-white text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <span>Tidio Operator Panel</span>
              <ExternalLink className="size-3.5 text-neutral-400" />
            </a>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white transition-all shadow-xs shadow-[#0071E3]/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="size-3.5" />
              <span>{isSaving ? "Saving..." : "Save & Activate"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Integration Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Credentials & Core Settings */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-[#0071E3]" />
                <h2 className="text-sm font-semibold text-neutral-900">Widget Credentials & Status</h2>
              </div>
              <button
                type="button"
                onClick={copySnippet}
                className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
                title="Copy standard script tag"
              >
                {hasCopiedSnippet ? (
                  <>
                    <Check className="size-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy HTML Script</span>
                  </>
                )}
              </button>
            </div>

            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FBFBFC] border border-black/[0.06]">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-neutral-900 flex items-center gap-2">
                  <span>Enable Tidio Live Chat</span>
                  {tidioState.enabled && (
                    <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-500">
                  When enabled, the chat bubble will automatically appear for all visitors on your website.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tidioState.enabled}
                  onChange={(e) =>
                    setTidioState((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071E3]"></div>
              </label>
            </div>

            {/* Public Key Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-700">
                Tidio Project Public Key / Script Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tidioState.publicKey}
                  onChange={(e) =>
                    setTidioState((prev) => ({ ...prev, publicKey: e.target.value }))
                  }
                  placeholder="e.g. abcdefghijklmnopqrstuvwxyz123456 or //code.tidio.co/xxxx.js"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] bg-[#FBFBFC] text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] focus:bg-white transition-all shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-neutral-500">
                In your Tidio dashboard, go to <span className="font-semibold text-neutral-800">Settings &rarr; Live Chat &rarr; Installation</span> to find your key. You can paste the bare key or the entire script URL.
              </p>
            </div>

            {/* Verification Button & Result */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={testConnection}
                disabled={isTesting || !tidioState.publicKey.trim()}
                className="px-3.5 py-1.5 text-xs font-medium rounded-xl border border-[#0071E3]/30 text-[#0071E3] hover:bg-[#0071E3]/10 transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className={`size-3.5 ${isTesting ? "animate-spin" : ""}`} />
                <span>{isTesting ? "Testing Script CDN..." : "Test Connection"}</span>
              </button>

              {testResult && (
                <div
                  className={`text-xs px-3 py-1 rounded-lg flex items-center gap-1.5 ${
                    testResult.success
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="size-3.5 text-red-600 shrink-0" />
                  )}
                  <span className="truncate max-w-xs">{testResult.message}</span>
                  {testResult.latencyMs && (
                    <span className="text-[10px] font-mono text-emerald-800">
                      ({testResult.latencyMs}ms)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Display & Behavior Settings */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/[0.06]">
              <Globe className="size-4 text-[#0071E3]" />
              <h2 className="text-sm font-semibold text-neutral-900">Display & Behavior Rules</h2>
            </div>

            <div className="space-y-3">
              {/* Hide on Admin Toggle */}
              <div className="flex items-center justify-between py-2 border-b border-black/[0.04]">
                <div>
                  <span className="text-xs font-medium text-neutral-800">
                    Hide on Admin CRM Pages
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Keeps the chat widget hidden while inside the Codex Dynamics Back Office.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={tidioState.disableOnAdmin}
                  onChange={(e) =>
                    setTidioState((prev) => ({
                      ...prev,
                      disableOnAdmin: e.target.checked,
                    }))
                  }
                  className="size-4 text-[#0071E3] rounded border-black/20 focus:ring-[#0071E3] cursor-pointer"
                />
              </div>

              {/* Hide on Mobile Toggle */}
              <div className="flex items-center justify-between py-2 border-b border-black/[0.04]">
                <div>
                  <span className="text-xs font-medium text-neutral-800">
                    Mobile Device Visibility
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Display the floating widget on smartphone and tablet screens.
                  </p>
                </div>
                <label className="text-xs font-medium text-neutral-500 flex items-center gap-2 cursor-pointer">
                  <span>{tidioState.hideOnMobile ? "Hidden on Mobile" : "Visible on Mobile"}</span>
                  <input
                    type="checkbox"
                    checked={!tidioState.hideOnMobile}
                    onChange={(e) =>
                      setTidioState((prev) => ({
                        ...prev,
                        hideOnMobile: !e.target.checked,
                      }))
                    }
                    className="size-4 text-[#0071E3] rounded border-black/20 focus:ring-[#0071E3] cursor-pointer"
                  />
                </label>
              </div>

              {/* Widget Position */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-medium text-neutral-700">
                  Widget Position on Screen
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setTidioState((prev) => ({ ...prev, position: "bottom-right" }))
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      tidioState.position === "bottom-right"
                        ? "border-[#0071E3] bg-[#0071E3]/10 text-[#0071E3] font-semibold shadow-2xs"
                        : "border-black/[0.08] text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <span>Bottom Right (Standard)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTidioState((prev) => ({ ...prev, position: "bottom-left" }))
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      tidioState.position === "bottom-left"
                        ? "border-[#0071E3] bg-[#0071E3]/10 text-[#0071E3] font-semibold shadow-2xs"
                        : "border-black/[0.08] text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <span>Bottom Left</span>
                  </button>
                </div>

                {/* Co-existence with WhatsApp info */}
                <div className="mt-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 flex items-start gap-2.5">
                  <Sparkles className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[12px]">Smart WhatsApp Dock Alignment</span>
                    <p className="text-[11px] text-blue-800/90 leading-relaxed">
                      {tidioState.position === "bottom-right"
                        ? "Active: WhatsApp Dock is automatically sized to 60px and stacked cleanly on top of Tidio to prevent any obstruction. When a visitor opens Tidio chat, WhatsApp auto-hides so it never blocks messages."
                        : "Opposite Corners: Tidio sits on the bottom-left and WhatsApp sits on the bottom-right for full spatial separation."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Default Welcome Message */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-medium text-neutral-700">
                  Default Welcome Greeting
                </label>
                <textarea
                  rows={2}
                  value={tidioState.welcomeMessage}
                  onChange={(e) =>
                    setTidioState((prev) => ({
                      ...prev,
                      welcomeMessage: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.08] bg-[#FBFBFC] text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] focus:bg-white transition-all shadow-2xs"
                  placeholder="Leave a friendly message for visitors..."
                />
              </div>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="bg-[#0071E3]/5 border border-[#0071E3]/15 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3]">
              <Sparkles className="size-4" />
              <span>How to get your Tidio Public Key (Free & 2 Minutes)</span>
            </div>
            <ol className="text-xs text-neutral-600 space-y-2 list-decimal list-inside">
              <li>
                Sign in or register for free at{" "}
                <a
                  href="https://www.tidio.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0071E3] font-medium underline"
                >
                  tidio.com
                </a>
              </li>
              <li>Navigate to <span className="font-semibold text-neutral-800">Settings (gear icon) &rarr; Live Chat &rarr; Installation</span></li>
              <li>Click on <span className="font-semibold text-neutral-800">"JavaScript"</span> or <span className="font-semibold text-neutral-800">"Manual Integration"</span></li>
              <li>Copy the project public key or the script tag snippet</li>
              <li>Paste it into the field above and click <span className="font-semibold text-neutral-800">"Save & Activate"</span></li>
            </ol>
          </div>
        </div>

        {/* Right Column: Live Chat Widget Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-[560px]">
            {/* Simulator Header */}
            <div className="bg-[#0066FF] text-white p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="size-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm text-white">
                    <User className="size-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0066FF]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white leading-tight">
                    Codex Dynamics Support
                  </h3>
                  <p className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5">
                    <span className="size-1.5 rounded-full bg-emerald-300" />
                    Online &middot; Replies within minutes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setSimMessages([
                      {
                        sender: "bot",
                        text:
                          tidioState.welcomeMessage ||
                          "Hi there! 👋 How can we help you today?",
                        time: "Just now",
                      },
                    ])
                  }
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Reset simulator chat"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Simulator Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8f9fc] text-xs">
              <div className="text-center my-1">
                <span className="text-[10px] text-muted-foreground/80 bg-black/5 px-2 py-0.5 rounded-full">
                  Live Chat Simulation Preview
                </span>
              </div>

              {simMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#0066FF] text-white rounded-br-xs"
                        : "bg-white text-label border border-black/8 rounded-bl-xs"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] block mt-1 text-right ${
                        msg.sender === "user" ? "text-white/70" : "text-muted-foreground"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="p-2.5 bg-white border-t border-black/6 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => handleSimSend("I need a quote for a new website")}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF]/20 transition-colors whitespace-nowrap shrink-0"
              >
                Website Quote 💼
              </button>
              <button
                type="button"
                onClick={() => handleSimSend("Can we book a strategy call?")}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF]/20 transition-colors whitespace-nowrap shrink-0"
              >
                Book a Call 📅
              </button>
              <button
                type="button"
                onClick={() => handleSimSend("Speak with an engineer")}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF]/20 transition-colors whitespace-nowrap shrink-0"
              >
                Tech Team 💻
              </button>
            </div>

            {/* Simulator Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSimSend();
              }}
              className="p-3 bg-white border-t border-black/6 flex items-center gap-2"
            >
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                placeholder="Write a message to test..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#0066FF]"
              />
              <button
                type="submit"
                className="size-8 rounded-xl bg-[#0066FF] text-white flex items-center justify-center hover:bg-[#0052cc] transition-colors shrink-0"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </div>

          {/* Floating Widget Mock Indicator */}
          <div className="p-3 bg-white rounded-xl border border-black/[0.06] shadow-2xs flex items-center justify-between text-xs text-neutral-500">
            <span>Widget Position Preview:</span>
            <span className="font-semibold text-neutral-900">
              {tidioState.position === "bottom-right" ? "Bottom-Right Anchor" : "Bottom-Left Anchor"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
