const NEXT_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "gyaanstore.com",
  "www.gyaanstore.com",
]);

const IMAGE_PROXY_PATH = "/api/image-proxy";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function tryDecodeUrlParam(value: string | null): string | null {
  if (!value) return null;

  const candidates = [value];
  try {
    candidates.push(decodeURIComponent(value));
  } catch {
    // Keep the raw candidate if decoding fails.
  }

  for (const candidate of candidates) {
    if (isHttpUrl(candidate)) {
      return candidate;
    }
  }

  return null;
}

function unwrapBrowserRedirectUrl(value: string): string {
  if (!isHttpUrl(value)) {
    return value;
  }

  const url = new URL(value);
  const host = url.hostname.toLowerCase();

  const googleLikeHost = host.includes("google.");
  if (googleLikeHost) {
    const direct =
      tryDecodeUrlParam(url.searchParams.get("imgurl")) ??
      tryDecodeUrlParam(url.searchParams.get("url")) ??
      tryDecodeUrlParam(url.searchParams.get("q"));
    if (direct) return direct;
  }

  if (host.includes("bing.com")) {
    const direct =
      tryDecodeUrlParam(url.searchParams.get("mediaurl")) ??
      tryDecodeUrlParam(url.searchParams.get("url"));
    if (direct) return direct;
  }

  if (host.includes("duckduckgo.com")) {
    const direct = tryDecodeUrlParam(url.searchParams.get("uddg"));
    if (direct) return direct;
  }

  if (host.includes("facebook.com")) {
    const direct = tryDecodeUrlParam(url.searchParams.get("u"));
    if (direct) return direct;
  }

  return value;
}

export function normalizeImageUrlInput(src: string | null | undefined): string | null | undefined {
  if (src === null || src === undefined) {
    return src;
  }

  const trimmed = src.trim();
  if (!trimmed) {
    return "";
  }

  if (!trimmed.startsWith("/")) {
    const looksLikeDomain =
      !/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(trimmed) &&
      /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}([/:?#].*)?$/i.test(trimmed);

    const withProtocol = looksLikeDomain ? `https://${trimmed}` : trimmed;
    return unwrapBrowserRedirectUrl(withProtocol);
  }

  return trimmed
    .replace(/\\/g, "/")
    .replace(/\s+/g, "-")
    .replace(/\/{2,}/g, "/")
    .toLowerCase();
}

export function getRenderableImageSrc(src: string | null | undefined): string | null {
  if (!src) {
    return null;
  }

  if (src.startsWith("/")) {
    return src;
  }

  try {
    const url = new URL(src);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return `${IMAGE_PROXY_PATH}?url=${encodeURIComponent(url.toString())}`;
  } catch {
    return null;
  }
}

export function canUseNextImage(src: string | null | undefined): boolean {
  if (!src) return false;

  if (src.startsWith(IMAGE_PROXY_PATH)) {
    return false;
  }

  if (src.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(src);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    return NEXT_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
