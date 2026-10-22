const isDev = process.env.NODE_ENV === "development";
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Content Security Policy: where the page may load code, styles, images and data from.
// Scripts, fonts and images come from this site only; the browser talks to Supabase
// (catalog, accounts, orders) and nowhere else; no other site may show this one in a frame.
// 'unsafe-inline' is needed by the scripts Next.js inlines in statically generated pages
// (nonces would make every page dynamic); 'unsafe-eval' only in development, for React's
// error overlays. Paying happens on Mercado Pago's own site, reached by a normal navigation.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabase} ${supabase.replace(/^https:/, "wss:")}`.trim(),
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Older browsers' version of frame-ancestors: no clickjacking through iframes.
  { key: "X-Frame-Options", value: "DENY" },
  // Files are only ever run as the type the server says they are.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites see only this site's address, never the page or its query (e.g. ?next=).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site never needs the camera, microphone, location or payment APIs of the browser.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // Always HTTPS, for two years (production only: localhost is plain HTTP).
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
