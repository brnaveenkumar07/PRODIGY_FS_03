import { NextRequest, NextResponse } from "next/server";
import { isIP } from "node:net";

const REQUEST_TIMEOUT_MS = 12_000;
const IMAGE_CONTENT_TYPE = /^image\//i;
const HTML_CONTENT_TYPE = /^text\/html/i;

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower.endsWith(".local")
  ) {
    return true;
  }

  const ipVersion = isIP(lower);
  if (ipVersion === 4) {
    return isPrivateIPv4(lower);
  }

  if (ipVersion === 6) {
    return isPrivateIPv6(lower);
  }

  return false;
}

function decodeHtmlAttr(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function toAbsoluteHttpUrl(candidate: string, baseUrl: URL): string | null {
  const normalized = decodeHtmlAttr(candidate).trim();
  if (!normalized || normalized.startsWith("data:") || normalized.startsWith("blob:")) {
    return null;
  }

  try {
    const absolute = new URL(normalized, baseUrl);
    if (absolute.protocol !== "http:" && absolute.protocol !== "https:") {
      return null;
    }

    if (isBlockedHostname(absolute.hostname)) {
      return null;
    }

    return absolute.toString();
  } catch {
    return null;
  }
}

function extractAttr(tag: string, attr: string): string | null {
  const regex = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "i");
  const match = tag.match(regex);
  return match?.[1] ?? null;
}

function extractImageCandidates(html: string): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();
  const pushUnique = (value: string | null) => {
    if (!value) return;
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    candidates.push(trimmed);
  };

  const metaTagRegex = /<meta\b[^>]*>/gi;
  let metaMatch: RegExpExecArray | null;
  while ((metaMatch = metaTagRegex.exec(html)) !== null) {
    const tag = metaMatch[0];
    const property = extractAttr(tag, "property")?.toLowerCase() ?? "";
    const name = extractAttr(tag, "name")?.toLowerCase() ?? "";
    const isImageMeta =
      property === "og:image" ||
      property === "og:image:secure_url" ||
      name === "twitter:image" ||
      name === "twitter:image:src";

    if (isImageMeta) {
      pushUnique(extractAttr(tag, "content"));
    }
  }

  const linkTagRegex = /<link\b[^>]*>/gi;
  let linkMatch: RegExpExecArray | null;
  while ((linkMatch = linkTagRegex.exec(html)) !== null) {
    const tag = linkMatch[0];
    const rel = extractAttr(tag, "rel")?.toLowerCase() ?? "";
    if (rel.includes("image_src")) {
      pushUnique(extractAttr(tag, "href"));
    }
  }

  const imgTagRegex = /<img\b[^>]*>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgTagRegex.exec(html)) !== null) {
    pushUnique(extractAttr(imgMatch[0], "src"));
    if (candidates.length >= 12) {
      break;
    }
  }

  return candidates.slice(0, 12);
}

async function fetchRemote(url: string): Promise<Response> {
  return fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8,text/html;q=0.5",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
}

function buildImageResponse(response: Response): NextResponse {
  const headers = new Headers();
  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  headers.set("content-type", contentType);
  headers.set("cache-control", "public, max-age=3600, s-maxage=3600");

  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    headers.set("content-length", contentLength);
  }

  const etag = response.headers.get("etag");
  if (etag) {
    headers.set("etag", etag);
  }

  const lastModified = response.headers.get("last-modified");
  if (lastModified) {
    headers.set("last-modified", lastModified);
  }

  return new NextResponse(response.body, { status: 200, headers });
}

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return NextResponse.json({ error: "Unsupported URL protocol" }, { status: 400 });
  }

  if (isBlockedHostname(targetUrl.hostname)) {
    return NextResponse.json({ error: "Blocked image host" }, { status: 400 });
  }

  try {
    const directResponse = await fetchRemote(targetUrl.toString());
    if (directResponse.ok) {
      const contentType = directResponse.headers.get("content-type") ?? "";
      if (IMAGE_CONTENT_TYPE.test(contentType)) {
        return buildImageResponse(directResponse);
      }

      if (HTML_CONTENT_TYPE.test(contentType)) {
        const html = await directResponse.text();
        const candidates = extractImageCandidates(html);
        const attempted = new Set<string>();

        for (const candidate of candidates) {
          const absolute = toAbsoluteHttpUrl(candidate, targetUrl);
          if (!absolute || attempted.has(absolute)) {
            continue;
          }
          attempted.add(absolute);

          const imageResponse = await fetchRemote(absolute);
          const imageType = imageResponse.headers.get("content-type") ?? "";
          if (imageResponse.ok && IMAGE_CONTENT_TYPE.test(imageType)) {
            return buildImageResponse(imageResponse);
          }
        }
      }
    }

    return NextResponse.json(
      { error: "Unable to resolve an image from this link. Use a direct image URL." },
      { status: 422 }
    );
  } catch (error) {
    console.error("Image proxy failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch remote image" },
      { status: 502 }
    );
  }
}
