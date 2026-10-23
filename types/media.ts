export type Platform =
  | "instagram"
  | "youtube"
  | "facebook"
  | "pinterest"
  | "vimeo";

export type ContentType =
  | "reel"
  | "post"
  | "video"
  | "short"
  | "image"
  | "carousel"
  | "audio"
  | "clip"
  | "story";

export type MediaItem = {
  id: string;
  type: "video" | "image" | "audio";
  url?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  quality?: string;
  format?: string;
  size?: number;
};

export type MediaResult = {
  platform: Platform;
  contentType: ContentType;
  title?: string;
  thumbnail?: string;
  author?: { name?: string; username?: string; avatar?: string };
  media: MediaItem[];
  expiresAt?: string;
  cached?: boolean;
};

export type ApiErrorCode =
  | "INVALID_URL"
  | "UNSUPPORTED_PLATFORM"
  | "PRIVATE_CONTENT"
  | "UNAVAILABLE"
  | "RESOLVER_FAILED"
  | "RATE_LIMITED";

export interface PlatformAdapter {
  platform: Platform;
  canHandle(url: string): boolean;
  resolve(url: string): Promise<MediaResult>;
}
