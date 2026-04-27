import { api } from "./client";

type QueryPrimitive = string | number | boolean | null | undefined;
type JsonObject = Record<string, unknown>;

function withQuery<T extends object>(path: string, query?: T): string {
  if (!query) return path;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query as Record<string, QueryPrimitive>)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export type Platform = "IOS" | "AOS" | "WEB";

export interface GoogleAuthCallbackResponse {
  accessToken: string;
}

export interface GoogleRefreshResponse {
  accessToken: string;
}

export interface SaveApplicationDraftRequest {
  cohortPartId: number;
  answers: JsonObject;
}

export interface SubmitApplicationRequest {
  cohortPartId: number;
  applicantName: string;
  applicantPhone: string;
  applicantBirthDate?: string;
  applicantRegion?: string;
  answers: JsonObject;
  privacyAgreed: boolean;
}

export interface SubscribeEarlyNotificationRequest {
  cohortId: number;
  email: string;
}

export interface PublicListQuery {
  cursor?: string;
  limit?: number;
}

export interface ProjectListQuery extends PublicListQuery {
  platform?: Platform;
}

export interface DiscordAuthorizeQuery {
  applicationFormId: string;
}

export interface DiscordCallbackQuery {
  code: string;
  state: string;
}

export interface DiscordLinkQuery {
  applicationFormId: string;
}

export const webApi = {
  getHealth: () => api.get<JsonObject>("/api/v1/health"),

  getGoogleLoginUrl: () => api.get<void>("/api/v1/auth/google"),
  getGoogleLoginCallback: () => api.get<GoogleAuthCallbackResponse>("/api/v1/auth/google/callback"),
  refreshAuthToken: () => api.post<GoogleRefreshResponse>("/api/v1/auth/refresh", null),
  logout: () => api.post<null>("/api/v1/auth/logout", null),
  withdrawal: () => api.delete<null>("/api/v1/auth/withdrawal"),

  getActiveCohort: () => api.get<JsonObject>("/api/v1/cohorts/active"),

  saveApplicationDraft: (payload: SaveApplicationDraftRequest) =>
    api.post<JsonObject>("/api/v1/applications/draft", JSON.stringify(payload)),
  getApplicationDraftByPart: (cohortPartId: number) =>
    api.get<JsonObject>(`/api/v1/applications/draft/${cohortPartId}`),
  submitApplication: (payload: SubmitApplicationRequest) =>
    api.post<JsonObject>("/api/v1/applications", JSON.stringify(payload)),

  subscribeEarlyNotification: (payload: SubscribeEarlyNotificationRequest) =>
    api.post<JsonObject>("/api/v1/early-notifications", JSON.stringify(payload)),

  getBlogPosts: (query?: PublicListQuery) =>
    api.get<JsonObject>(withQuery("/api/v1/blog-posts", query)),

  getProjects: (query?: ProjectListQuery) =>
    api.get<JsonObject>(withQuery("/api/v1/projects", query)),
  getProjectById: (id: number) => api.get<JsonObject>(`/api/v1/projects/${id}`),

  getDiscordAuthorizeUrl: (query: DiscordAuthorizeQuery) =>
    api.get<JsonObject>(withQuery("/api/v1/discord/oauth/authorize", query)),
  getDiscordOAuthCallback: (query: DiscordCallbackQuery) =>
    api.get<JsonObject>(withQuery("/api/v1/discord/oauth/callback", query)),
  getDiscordLink: (query: DiscordLinkQuery) =>
    api.get<JsonObject>(withQuery("/api/v1/discord/link", query)),
};
