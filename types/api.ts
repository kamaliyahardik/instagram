import type { ContentType, MediaResult, Platform } from "@/types/media";

export type ResolveRequest = { url: string };
export type ResolveResponse =
  | ({ success: true } & MediaResult)
  | { success: false; error: string; code: string };

export type DownloadRequest = { sourceUrl: string; mediaId?: string; quality?: string };
export { type ContentType, type MediaResult, type Platform };
