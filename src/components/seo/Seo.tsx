import { useEffect } from "react";

const SITE_URL = "https://c2c.lovable.app";

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(
    `meta[${attr}="${key}"]`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(
    `link[rel="${rel}"]`
  ) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Per-route SEO head manager. Updates title, description, canonical,
 * Open Graph / Twitter meta, and optional JSON-LD structured data.
 */
export function Seo({
  title,
  description,
  path,
  ogType = "website",
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const currentPath =
      path ??
      (typeof window !== "undefined" ? window.location.pathname : "/");
    const normalizedPath =
      currentPath === "/" ? "" : currentPath.replace(/\/$/, "");
    const canonical = `${SITE_URL}${normalizedPath || ""}` || SITE_URL;
    const ogImage = `${SITE_URL}/og-image.png`;

    const previousTitle = document.title;
    document.title = title;

    upsertMeta("name", "description", description);
    upsertLink("canonical", canonical);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);

    let scriptEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.dataset.seo = "page";
      scriptEl.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }

    return () => {
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
      document.title = previousTitle;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, ogType, JSON.stringify(jsonLd ?? null)]);

  return null;
}

export default Seo;