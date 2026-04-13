import api, { getApiErrorMessage } from "@/services/api";

export interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
  durationSeconds: number;
  tags: string[];
}

interface GifSearchEnvelope {
  success: boolean;
  message?: string;
  query?: string;
  count?: number;
  next?: string;
  results?: GifItem[];
}

interface GifFetchParams {
  limit?: number;
  pos?: string;
}

const resolveEndpointCandidates = (endpoint: string) => {
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const baseUrl = String(api.defaults.baseURL || "");
  const hasApiPrefix = /\/api\/?$/i.test(baseUrl);

  if (hasApiPrefix) {
    return [normalized];
  }

  return [`/api${normalized}`, normalized];
};

const getStatusCode = (error: unknown): number | null => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return typeof status === "number" ? status : null;
};

const getPagedResults = async (
  endpoint: string,
  params: Record<string, string>,
): Promise<{ next: string; results: GifItem[] }> => {
  const candidates = resolveEndpointCandidates(endpoint);
  let lastError: unknown = null;

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    try {
      const { data } = await api.get<GifSearchEnvelope>(candidate, {
        params,
      });

      return {
        next: data.next || "",
        results: Array.isArray(data.results) ? data.results : [],
      };
    } catch (error) {
      lastError = error;
      const status = getStatusCode(error);
      const hasNextCandidate = i < candidates.length - 1;
      if (status === 404 && hasNextCandidate) {
        continue;
      }
      throw new Error(getApiErrorMessage(error, "Unable to load GIFs"));
    }
  }

  const lastStatus = getStatusCode(lastError);
  if (lastStatus === 404) {
    throw new Error(
      "GIF routes not found (404). Restart backend and verify NEXT_PUBLIC_API_URL includes /api.",
    );
  }

  throw new Error(getApiErrorMessage(lastError, "Unable to load GIFs"));
};

const toBaseParams = ({ limit = 24, pos = "" }: GifFetchParams) => {
  const safeLimit = Number.isFinite(limit) ? String(Math.max(1, limit)) : "24";
  return {
    limit: safeLimit,
    pos: String(pos || ""),
  };
};

export const searchGifs = async (
  query: string,
  params: GifFetchParams = {},
): Promise<{ next: string; results: GifItem[] }> =>
  getPagedResults("/gifs/search", {
    ...toBaseParams(params),
    q: query.trim(),
  });

export const getTrendingGifs = async (
  params: GifFetchParams = {},
): Promise<{ next: string; results: GifItem[] }> =>
  getPagedResults("/gifs/trending", toBaseParams(params));

export const searchStickers = async (
  query: string,
  params: GifFetchParams = {},
): Promise<{ next: string; results: GifItem[] }> =>
  getPagedResults("/gifs/stickers/search", {
    ...toBaseParams(params),
    q: query.trim(),
  });

export const getTrendingStickers = async (
  params: GifFetchParams = {},
): Promise<{ next: string; results: GifItem[] }> =>
  getPagedResults("/gifs/stickers/trending", toBaseParams(params));
