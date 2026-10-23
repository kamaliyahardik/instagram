import type { MediaResult, PlatformAdapter } from "@/types/media";
import { detectPlatform } from "@/lib/resolver/detector";
import {
  facebookAdapter,
  instagramAdapter,
  pinterestAdapter,
  vimeoAdapter,
  youtubeAdapter,
} from "@/lib/resolver/adapters";

const ADAPTERS: PlatformAdapter[] = [
  instagramAdapter,
  youtubeAdapter,
  facebookAdapter,
  pinterestAdapter,
  vimeoAdapter,
];

export class ResolverError extends Error {
  code: "INVALID_URL" | "UNSUPPORTED_PLATFORM" | "PRIVATE_CONTENT" | "UNAVAILABLE" | "RESOLVER_FAILED";
  platform?: string;
  constructor(
    code: ResolverError["code"],
    message: string,
    platform?: string,
  ) {
    super(message);
    this.code = code;
    this.platform = platform;
  }
}

export function getAdapter(url: string): PlatformAdapter | null {
  const platform = detectPlatform(url);
  if (!platform) return ADAPTERS.find((a) => a.canHandle(url)) ?? null;
  return ADAPTERS.find((a) => a.platform === platform) ?? null;
}

export async function resolveMedia(url: string): Promise<MediaResult> {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new ResolverError("INVALID_URL", "That doesn't look like a supported media link.");
  }
  if (!["http:", "https:"].includes(parsed.protocol))
    throw new ResolverError("INVALID_URL", "That doesn't look like a supported media link.");

  const adapter = getAdapter(url);
  if (!adapter)
    throw new ResolverError("UNSUPPORTED_PLATFORM", "We don't support this platform yet.");

  // Failure isolation: one broken adapter never crashes the API.
  try {
    const result = await adapter.resolve(url);
    return result;
  } catch (e) {
    if (e instanceof ResolverError) throw e;
    throw new ResolverError(
      "RESOLVER_FAILED",
      "This media is currently unavailable.",
      adapter.platform,
    );
  }
}

export const platformStatus: Record<string, "Operational" | "Degraded" | "Unavailable"> = {
  instagram: "Operational",
  youtube: "Operational",
  facebook: "Operational",
  pinterest: "Operational",
  vimeo: "Operational",
};
