import React from "react";

export interface CountryFlagProps {
  country?: string;
  countryCode?: string;
  flag?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Normalize country string or country code to standard 2-letter uppercase code
function normalizeCountryCode(countryOrCode?: any): string {
  if (!countryOrCode) return "GLOBAL";
  let raw = "";
  if (typeof countryOrCode === "string") {
    raw = countryOrCode;
  } else if (typeof countryOrCode === "object") {
    raw = countryOrCode.countryCode || countryOrCode.country_code || countryOrCode.country || "";
  } else {
    raw = String(countryOrCode);
  }

  const str = raw.trim();
  const lower = str.toLowerCase();

  if (lower === "us" || lower === "usa" || lower.includes("united states") || lower.includes("america")) return "US";
  if (lower === "gb" || lower === "uk" || lower.includes("united kingdom") || lower.includes("britain") || lower.includes("england")) return "GB";
  if (lower === "de" || lower.includes("germany") || lower.includes("deutschland")) return "DE";
  if (lower === "ua" || lower.includes("ukraine")) return "UA";
  if (lower === "ca" || lower.includes("canada")) return "CA";
  if (lower === "fr" || lower.includes("france")) return "FR";
  if (lower === "ae" || lower.includes("emirates") || lower.includes("dubai")) return "AE";
  if (lower === "jp" || lower.includes("japan")) return "JP";
  if (lower === "au" || lower.includes("australia")) return "AU";
  if (lower === "sg" || lower.includes("singapore")) return "SG";
  if (lower === "nl" || lower.includes("netherlands") || lower.includes("holland")) return "NL";
  if (lower === "ch" || lower.includes("switzerland") || lower.includes("swiss")) return "CH";
  if (lower === "it" || lower.includes("italy") || lower.includes("italia")) return "IT";
  if (lower === "es" || lower.includes("spain") || lower.includes("espana")) return "ES";
  if (lower === "se" || lower.includes("sweden")) return "SE";
  if (lower === "in" || lower.includes("india")) return "IN";
  if (lower === "br" || lower.includes("brazil") || lower.includes("brasil")) return "BR";
  if (lower === "pl" || lower.includes("poland")) return "PL";

  // Check 2-letter code
  if (str.length === 2) return str.toUpperCase();
  return "GLOBAL";
}

/**
 * High-fidelity SVG Country Flags
 * Renders authentic graphical national flags across all operating systems
 * (ensuring Windows users see true graphical flags rather than plain text country initials).
 */
export function CountryFlag({
  country,
  countryCode,
  flag,
  className = "",
  size = "md",
}: CountryFlagProps) {
  const code = normalizeCountryCode(countryCode || country);

  // Size dimensions
  const dimensions = {
    sm: "w-4 h-3 rounded-[2px]",
    md: "w-5 h-3.5 rounded-[3px]",
    lg: "w-7 h-5 rounded-[4px]",
  }[size];

  const wrapperClass = `inline-flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-black/10 select-none ${dimensions} ${className}`;

  switch (code) {
    case "US":
      return (
        <span className={wrapperClass} title={country || "United States"}>
          <svg viewBox="0 0 64 48" className="w-full h-full object-cover">
            {/* 13 Stripes */}
            <rect width="64" height="48" fill="#B22234" />
            <rect y="3.69" width="64" height="3.69" fill="#FFFFFF" />
            <rect y="11.07" width="64" height="3.69" fill="#FFFFFF" />
            <rect y="18.46" width="64" height="3.69" fill="#FFFFFF" />
            <rect y="25.84" width="64" height="3.69" fill="#FFFFFF" />
            <rect y="33.23" width="64" height="3.69" fill="#FFFFFF" />
            <rect y="40.61" width="64" height="3.69" fill="#FFFFFF" />
            {/* Blue Canton */}
            <rect width="28" height="26" fill="#3C3B6E" />
            {/* Stars grid representation */}
            <g fill="#FFFFFF" opacity="0.95">
              <circle cx="5" cy="5" r="1.3" />
              <circle cx="10" cy="5" r="1.3" />
              <circle cx="15" cy="5" r="1.3" />
              <circle cx="20" cy="5" r="1.3" />
              <circle cx="25" cy="5" r="1.3" />
              <circle cx="7.5" cy="9" r="1.3" />
              <circle cx="12.5" cy="9" r="1.3" />
              <circle cx="17.5" cy="9" r="1.3" />
              <circle cx="22.5" cy="9" r="1.3" />
              <circle cx="5" cy="13" r="1.3" />
              <circle cx="10" cy="13" r="1.3" />
              <circle cx="15" cy="13" r="1.3" />
              <circle cx="20" cy="13" r="1.3" />
              <circle cx="25" cy="13" r="1.3" />
              <circle cx="7.5" cy="17" r="1.3" />
              <circle cx="12.5" cy="17" r="1.3" />
              <circle cx="17.5" cy="17" r="1.3" />
              <circle cx="22.5" cy="17" r="1.3" />
              <circle cx="5" cy="21" r="1.3" />
              <circle cx="10" cy="21" r="1.3" />
              <circle cx="15" cy="21" r="1.3" />
              <circle cx="20" cy="21" r="1.3" />
              <circle cx="25" cy="21" r="1.3" />
            </g>
          </svg>
        </span>
      );

    case "GB":
      return (
        <span className={wrapperClass} title={country || "United Kingdom"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <clipPath id="gb-clip">
              <rect width="60" height="40" />
            </clipPath>
            <g clipPath="url(#gb-clip)">
              {/* Blue field */}
              <rect width="60" height="40" fill="#012169" />
              {/* White diagonals */}
              <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
              {/* Red diagonals */}
              <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
              {/* White cross */}
              <path d="M30,0 v40 M0,20 h60" stroke="#FFFFFF" strokeWidth="12" />
              {/* Red cross */}
              <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="7" />
            </g>
          </svg>
        </span>
      );

    case "DE":
      return (
        <span className={wrapperClass} title={country || "Germany"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="60" height="13.33" fill="#000000" />
            <rect y="13.33" width="60" height="13.33" fill="#DD0000" />
            <rect y="26.66" width="60" height="13.34" fill="#FFCE00" />
          </svg>
        </span>
      );

    case "UA":
      return (
        <span className={wrapperClass} title={country || "Ukraine"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="60" height="20" fill="#0057B7" />
            <rect y="20" width="60" height="20" fill="#FFDD00" />
          </svg>
        </span>
      );

    case "CA":
      return (
        <span className={wrapperClass} title={country || "Canada"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="15" height="40" fill="#FF0000" />
            <rect x="15" width="30" height="40" fill="#FFFFFF" />
            <rect x="45" width="15" height="40" fill="#FF0000" />
            {/* Maple leaf */}
            <path
              d="M30 10 L32 15 L36 14 L34 19 L38 21 L35 24 L36 28 L32 26 L30.8 31 L29.2 31 L28 26 L24 28 L25 24 L22 21 L26 19 L24 14 L28 15 Z"
              fill="#FF0000"
            />
          </svg>
        </span>
      );

    case "FR":
      return (
        <span className={wrapperClass} title={country || "France"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="20" height="40" fill="#002654" />
            <rect x="20" width="20" height="40" fill="#FFFFFF" />
            <rect x="40" width="20" height="40" fill="#ED2939" />
          </svg>
        </span>
      );

    case "AE":
      return (
        <span className={wrapperClass} title={country || "United Arab Emirates"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect x="15" width="45" height="13.33" fill="#00732F" />
            <rect x="15" y="13.33" width="45" height="13.33" fill="#FFFFFF" />
            <rect x="15" y="26.66" width="45" height="13.34" fill="#000000" />
            <rect width="15" height="40" fill="#FF0000" />
          </svg>
        </span>
      );

    case "JP":
      return (
        <span className={wrapperClass} title={country || "Japan"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="60" height="40" fill="#FFFFFF" />
            <circle cx="30" cy="20" r="11" fill="#BC002D" />
          </svg>
        </span>
      );

    case "AU":
      return (
        <span className={wrapperClass} title={country || "Australia"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="60" height="40" fill="#00008B" />
            {/* Canton */}
            <g transform="scale(0.5)">
              <rect width="60" height="40" fill="#012169" />
              <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="6" />
              <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3" />
              <path d="M30,0 v40 M0,20 h60" stroke="#FFFFFF" strokeWidth="10" />
              <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="6" />
            </g>
            {/* Commonwealth star */}
            <circle cx="15" cy="30" r="4.5" fill="#FFFFFF" />
            {/* Southern Cross stars */}
            <circle cx="45" cy="10" r="2" fill="#FFFFFF" />
            <circle cx="51" cy="18" r="2" fill="#FFFFFF" />
            <circle cx="45" cy="32" r="2.3" fill="#FFFFFF" />
            <circle cx="39" cy="22" r="2" fill="#FFFFFF" />
            <circle cx="47" cy="24" r="1.3" fill="#FFFFFF" />
          </svg>
        </span>
      );

    case "SG":
      return (
        <span className={wrapperClass} title={country || "Singapore"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="60" height="20" fill="#ED2939" />
            <rect y="20" width="60" height="20" fill="#FFFFFF" />
            {/* Crescent */}
            <circle cx="13" cy="10" r="6" fill="#FFFFFF" />
            <circle cx="15.5" cy="10" r="5.2" fill="#ED2939" />
            {/* 5 Stars */}
            <circle cx="17" cy="7" r="1" fill="#FFFFFF" />
            <circle cx="19" cy="10" r="1" fill="#FFFFFF" />
            <circle cx="18" cy="13" r="1" fill="#FFFFFF" />
            <circle cx="15" cy="13" r="1" fill="#FFFFFF" />
            <circle cx="14.5" cy="9" r="1" fill="#FFFFFF" />
          </svg>
        </span>
      );

    case "NL":
      return (
        <span className={wrapperClass} title={country || "Netherlands"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="60" height="13.33" fill="#AE1C28" />
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
            <rect y="26.66" width="60" height="13.34" fill="#21468B" />
          </svg>
        </span>
      );

    case "CH":
      return (
        <span className={wrapperClass} title={country || "Switzerland"}>
          <svg viewBox="0 0 40 40" className="w-full h-full object-cover">
            <rect width="40" height="40" fill="#D52B1E" />
            <rect x="16" y="8" width="8" height="24" fill="#FFFFFF" />
            <rect x="8" y="16" width="24" height="8" fill="#FFFFFF" />
          </svg>
        </span>
      );

    case "IT":
      return (
        <span className={wrapperClass} title={country || "Italy"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="20" height="40" fill="#009246" />
            <rect x="20" width="20" height="40" fill="#FFFFFF" />
            <rect x="40" width="20" height="40" fill="#CE2B37" />
          </svg>
        </span>
      );

    case "ES":
      return (
        <span className={wrapperClass} title={country || "Spain"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="60" height="10" fill="#AA151B" />
            <rect y="10" width="60" height="20" fill="#F1BF00" />
            <rect y="30" width="60" height="10" fill="#AA151B" />
            {/* Coat of arms silhouette */}
            <circle cx="16" cy="20" r="4" fill="#AA151B" opacity="0.9" />
          </svg>
        </span>
      );

    case "SE":
      return (
        <span className={wrapperClass} title={country || "Sweden"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="60" height="40" fill="#006AA7" />
            <rect x="18" width="8" height="40" fill="#FECC00" />
            <rect y="16" width="60" height="8" fill="#FECC00" />
          </svg>
        </span>
      );

    case "IN":
      return (
        <span className={wrapperClass} title={country || "India"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="60" height="13.33" fill="#FF9933" />
            <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
            <rect y="26.66" width="60" height="13.34" fill="#138808" />
            <circle cx="30" cy="20" r="4.5" fill="none" stroke="#000080" strokeWidth="1" />
            <circle cx="30" cy="20" r="1.2" fill="#000080" />
          </svg>
        </span>
      );

    case "BR":
      return (
        <span className={wrapperClass} title={country || "Brazil"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="60" height="40" fill="#009739" />
            <polygon points="30,5 55,20 30,35 5,20" fill="#FEDD00" />
            <circle cx="30" cy="20" r="8" fill="#012169" />
            <path d="M 23,20 A 8,8 0 0,1 37,20" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
          </svg>
        </span>
      );

    case "PL":
      return (
        <span className={wrapperClass} title={country || "Poland"}>
          <svg viewBox="0 0 60 40" className="w-full h-full object-cover">
            <rect width="60" height="20" fill="#FFFFFF" />
            <rect y="20" width="60" height="20" fill="#DC143C" />
          </svg>
        </span>
      );

    default:
      // If an emoji flag is provided and not global, use it with nice container
      if (flag && flag !== "🌐" && flag !== "🌍") {
        return (
          <span className={wrapperClass} title={country || "Country"}>
            <span className="text-xs leading-none">{flag}</span>
          </span>
        );
      }

      // Default Global SVG
      return (
        <span className={wrapperClass} title={country || "Global"}>
          <svg viewBox="0 0 24 24" className="w-full h-full p-0.5 text-blue" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
        </span>
      );
  }
}
