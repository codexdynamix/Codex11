import React from "react";

export interface BrowserBadgeProps {
  browser?: string;
  browserString?: string;
  showFull?: boolean;
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export interface BrowserDetails {
  fullName: string;
  shortName: string;
  version: string;
  category: "chrome" | "safari" | "firefox" | "edge" | "opera" | "brave" | "other";
}

function parseBrowserDetails(rawInput?: string): BrowserDetails {
  const str = (rawInput || "").trim();
  const lower = str.toLowerCase();

  // Extract version if present (e.g., "Chrome 125", "Safari 17.4")
  const versionMatch = str.match(/(\d+(\.\d+)?)/);
  const version = versionMatch ? versionMatch[1] : "";

  if (lower.includes("edg")) {
    return {
      fullName: "Microsoft Edge",
      shortName: "Edge",
      version,
      category: "edge",
    };
  }

  if (lower.includes("opr") || lower.includes("opera")) {
    return {
      fullName: "Opera",
      shortName: "Opera",
      version,
      category: "opera",
    };
  }

  if (lower.includes("brave")) {
    return {
      fullName: "Brave",
      shortName: "Brave",
      version,
      category: "brave",
    };
  }

  if (lower.includes("firefox") || lower.includes("fxios")) {
    return {
      fullName: "Mozilla Firefox",
      shortName: "Firefox",
      version,
      category: "firefox",
    };
  }

  if (lower.includes("safari") && !lower.includes("chrome") && !lower.includes("crios")) {
    return {
      fullName: "Apple Safari",
      shortName: "Safari",
      version,
      category: "safari",
    };
  }

  if (lower.includes("chrome") || lower.includes("crios") || lower.includes("chromium")) {
    return {
      fullName: "Google Chrome",
      shortName: "Chrome",
      version,
      category: "chrome",
    };
  }

  return {
    fullName: str || "Web Browser",
    shortName: str || "Browser",
    version,
    category: "other",
  };
}

/**
 * Authentic SVG Vector Logos for Web Browsers
 */
export function BrowserIcon({
  category,
  className = "size-4",
}: {
  category: BrowserDetails["category"];
  className?: string;
}) {
  switch (category) {
    case "chrome":
      return (
        <svg viewBox="0 0 48 48" className={`${className} shrink-0`} fill="none">
          {/* Authentic Google Chrome 4-color Pinwheel */}
          {/* Yellow Top-Right Section */}
          <path
            d="M24 4C31.5 4 38 8.1 41.5 14.2L28.2 37.3C27 39.4 24.6 40.8 22 40.8L12.5 24.3L24 4Z"
            fill="#FBBC05"
          />
          {/* Red Top-Left Section */}
          <path
            d="M24 4C14.7 4 6.9 10.3 4.6 18.9L16.2 38.9L24 25.5C24 20.3 28.2 16 33.5 16H42.6C38.9 8.8 32 4 24 4Z"
            fill="#EA4335"
          />
          {/* Green Bottom Section */}
          <path
            d="M24 44C33.3 44 41.1 37.7 43.4 29.1L31.8 9.1L24 22.5C24 27.7 19.8 32 14.5 32H5.4C9.1 39.2 16 44 24 44Z"
            fill="#34A853"
          />
          {/* White inner border circle */}
          <circle cx="24" cy="24" r="10.5" fill="#FFFFFF" />
          {/* Blue Center Core */}
          <circle cx="24" cy="24" r="8" fill="#4285F4" />
        </svg>
      );

    case "safari":
      return (
        <svg viewBox="0 0 48 48" className={`${className} shrink-0`} fill="none">
          {/* Authentic Apple Safari Compass */}
          <defs>
            <linearGradient id="safari-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1B92FF" />
              <stop offset="100%" stopColor="#0550CE" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="22" fill="url(#safari-bg)" />
          {/* Dial tick marks */}
          <g stroke="#FFFFFF" strokeWidth="1.2" opacity="0.65" strokeLinecap="round">
            <line x1="24" y1="5" x2="24" y2="8" />
            <line x1="24" y1="40" x2="24" y2="43" />
            <line x1="5" y1="24" x2="8" y2="24" />
            <line x1="40" y1="24" x2="43" y2="24" />
            <line x1="10.5" y1="10.5" x2="12.7" y2="12.7" />
            <line x1="35.3" y1="35.3" x2="37.5" y2="37.5" />
            <line x1="37.5" y1="10.5" x2="35.3" y2="12.7" />
            <line x1="12.7" y1="35.3" x2="10.5" y2="37.5" />
          </g>
          {/* Compass Needle: Red Half */}
          <polygon points="24,24 22,22 36,12 26,26" fill="#FF3B30" />
          {/* Compass Needle: White Half */}
          <polygon points="24,24 26,26 12,36 22,22" fill="#FFFFFF" />
          {/* Center Rivet */}
          <circle cx="24" cy="24" r="2" fill="#FFFFFF" stroke="#0038A8" strokeWidth="0.8" />
        </svg>
      );

    case "firefox":
      return (
        <svg viewBox="0 0 48 48" className={`${className} shrink-0`} fill="none">
          {/* Authentic Mozilla Firefox Fox & Globe */}
          <defs>
            <radialGradient id="ff-globe" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#303A96" />
              <stop offset="70%" stopColor="#252468" />
              <stop offset="100%" stopColor="#1E174A" />
            </radialGradient>
            <linearGradient id="ff-flame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE033" />
              <stop offset="35%" stopColor="#FF7A00" />
              <stop offset="70%" stopColor="#FF2A4D" />
              <stop offset="100%" stopColor="#9C0084" />
            </linearGradient>
          </defs>
          {/* Globe */}
          <circle cx="24" cy="24" r="18" fill="url(#ff-globe)" />
          {/* Fox Tail and Body Swirl */}
          <path
            d="M38 12C35 8 29 6 25 7C29 9 31 13 29 16C27 19 22 18 20 23C18 28 20 33 24 35C19 35 15 32 14 28C13 24 15 20 18 17C13 19 10 23 10 28C10 36 16 42 24 42C33 42 40 35 40 26C40 20 39 15 38 12Z"
            fill="url(#ff-flame)"
          />
          {/* Fox Head & Ears Accent */}
          <path
            d="M36 12C38 15 37 20 35 22C34 19 32 17 30 16C32 14 34 13 36 12Z"
            fill="#FFDF00"
          />
        </svg>
      );

    case "edge":
      return (
        <svg viewBox="0 0 48 48" className={`${className} shrink-0`} fill="none">
          {/* Authentic Microsoft Edge Wave */}
          <defs>
            <linearGradient id="edge-grad1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0C59A4" />
              <stop offset="100%" stopColor="#119BE7" />
            </linearGradient>
            <linearGradient id="edge-grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1CD0BB" />
              <stop offset="100%" stopColor="#0B98E4" />
            </linearGradient>
          </defs>
          {/* Back Wave */}
          <path
            d="M24 4C13 4 4 13 4 24C4 32 9 39 16 42C14 39 13 35 13 31C13 22 20 15 29 15C34 15 38 17 41 20C39 11 32 4 24 4Z"
            fill="url(#edge-grad1)"
          />
          {/* Front Wave Swirl */}
          <path
            d="M44 26C44 36 35 44 25 44C16 44 9 37 9 28C9 23 12 18 16 15C16 23 23 29 31 29C38 29 44 25 44 26Z"
            fill="url(#edge-grad2)"
          />
        </svg>
      );

    case "opera":
      return (
        <svg viewBox="0 0 48 48" className={`${className} shrink-0`} fill="none">
          {/* Authentic Opera Red 'O' */}
          <defs>
            <linearGradient id="opera-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF424D" />
              <stop offset="100%" stopColor="#CC0914" />
            </linearGradient>
          </defs>
          <path
            d="M24 4C13 4 4 13 4 24C4 35 13 44 24 44C35 44 44 35 44 24C44 13 35 4 24 4ZM24 38C17.5 38 14 31.7 14 24C14 16.3 17.5 10 24 10C30.5 10 34 16.3 34 24C34 31.7 30.5 38 24 38Z"
            fill="url(#opera-grad)"
          />
        </svg>
      );

    case "brave":
      return (
        <svg viewBox="0 0 48 48" className={`${className} shrink-0`} fill="none">
          {/* Brave Lion Head Shield */}
          <path
            d="M24 4L38 10V22C38 31.5 32 40 24 44C16 40 10 31.5 10 22V10L24 4Z"
            fill="#FB542B"
          />
          <path
            d="M24 12L31 16V23C31 28 28 32.5 24 34.5C20 32.5 17 28 17 23V16L24 12Z"
            fill="#FFFFFF"
          />
          <polygon points="24,18 27,24 21,24" fill="#FB542B" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${className} shrink-0 text-muted-foreground`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect width="20" height="16" x="2" y="4" rx="3" />
          <path d="M2 9h20" />
          <circle cx="6" cy="6.5" r="0.75" fill="currentColor" />
          <circle cx="9" cy="6.5" r="0.75" fill="currentColor" />
          <circle cx="12" cy="6.5" r="0.75" fill="currentColor" />
        </svg>
      );
  }
}

/**
 * BrowserBadge Component
 * Renders the authentic browser logo/icon AND the full name of the browser.
 */
export function BrowserBadge({
  browser,
  browserString,
  showFull = false,
  className = "",
  iconOnly = false,
  size = "md",
}: BrowserBadgeProps) {
  const input = browser || browserString || "";
  const { fullName, shortName, version, category } = parseBrowserDetails(input);

  const displayName = showFull ? fullName : shortName;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-2",
    lg: "px-3 py-1.5 text-xs gap-2.5",
  }[size];

  const iconSizes = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5",
  }[size];

  // Specific theme styles per browser category
  const themeStyles: Record<string, string> = {
    chrome: "bg-emerald-50/80 text-emerald-900 border-emerald-200/80 hover:bg-emerald-50",
    safari: "bg-sky-50/80 text-sky-900 border-sky-200/80 hover:bg-sky-50",
    firefox: "bg-amber-50/80 text-amber-950 border-amber-200/80 hover:bg-amber-50",
    edge: "bg-cyan-50/80 text-cyan-950 border-cyan-200/80 hover:bg-cyan-50",
    opera: "bg-rose-50/80 text-rose-950 border-rose-200/80 hover:bg-rose-50",
    brave: "bg-orange-50/80 text-orange-950 border-orange-200/80 hover:bg-orange-50",
    other: "bg-fill text-label border-black/8 hover:bg-fill-subtle",
  };

  const badgeTheme = themeStyles[category] || themeStyles.other;

  if (iconOnly) {
    return (
      <span
        className={`inline-flex items-center justify-center ${className}`}
        title={`${fullName}${version ? ` ${version}` : ""}`}
      >
        <BrowserIcon category={category} className={iconSizes} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-lg font-medium border shadow-2xs transition-colors ${sizeClasses} ${badgeTheme} ${className}`}
      title={`${fullName} ${version ? `(Version ${version})` : ""}`}
    >
      {/* 1. Official Browser Icon */}
      <BrowserIcon category={category} className={iconSizes} />

      {/* 2. Explicit Browser Name */}
      <span className="font-semibold whitespace-nowrap tracking-tight">
        {displayName}
      </span>

      {/* 3. Version Number (if present) */}
      {version && (
        <span className="font-mono text-[10px] opacity-75 whitespace-nowrap">
          {version}
        </span>
      )}
    </span>
  );
}
