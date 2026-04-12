
export class GifServiceError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "GifServiceError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const TENOR_BASE_URL = "https://tenor.googleapis.com/v2";

const parsePositiveInt = (value, fallback) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

const getTenorApiKey = () => {
  const key =
    process.env.TENOR_API_KEY ||
    process.env.GIF_API_KEY ||
    process.env.GIPHY_API_KEY;
  if (!key) {
    throw new GifServiceError(
      "TENOR_API_KEY is required for GIF search service",
      500,
    );
  }
  return key;
};

const mapTenorResult = (item = {}) => {
  const mediaFormats = item.media_formats || {};
  const preferred =
    mediaFormats.gif ||
    mediaFormats.tinygif ||
    mediaFormats.mediumgif ||
    mediaFormats.nanogif ||
    {};

  return {
    id: item.id || "",
    title: item.content_description || "",
    url: item.itemurl || preferred.url || "",
    previewUrl: preferred.preview || preferred.url || "",
    width: preferred.dims?.[0] || 0,
    height: preferred.dims?.[1] || 0,
    durationSeconds: Number(preferred.duration || 0),
    tags: Array.isArray(item.tags) ? item.tags : [],
  };
};

const requestTenor = async (path, params = {}) => {
  const apiKey = getTenorApiKey();
  const searchParams = new URLSearchParams({
    key: apiKey,
    client_key: process.env.TENOR_CLIENT_KEY || "stickhere-backend",
    ...params,
  });

  const url = `${TENOR_BASE_URL}/${path}?${searchParams.toString()}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new GifServiceError(
      `GIF provider request failed with status ${response.status}`,
      502,
    );
  }

  return response.json();
};

export const searchGifsService = async ({
  query = "",
  limit = 20,
  pos = "",
  locale = "en_US",
  contentFilter = "off",
} = {}) => {
  const trimmedQuery = String(query).trim();
  if (!trimmedQuery) {
    throw new GifServiceError("query is required", 400);
  }

  const safeLimit = Math.min(parsePositiveInt(limit, 20), 50);
  const data = await requestTenor("search", {
    q: trimmedQuery,
    limit: String(safeLimit),
    pos: String(pos || ""),
    locale,
    contentfilter: contentFilter,
    media_filter: "gif,tinygif,mediumgif",
  });

  return {
    query: trimmedQuery,
    count: Array.isArray(data.results) ? data.results.length : 0,
    next: data.next || "",
    results: Array.isArray(data.results)
      ? data.results.map(mapTenorResult)
      : [],
  };
};

export const getTrendingGifsService = async ({
  limit = 20,
  pos = "",
  locale = "en_US",
  contentFilter = "off",
} = {}) => {
  const safeLimit = Math.min(parsePositiveInt(limit, 20), 50);
  const data = await requestTenor("featured", {
    limit: String(safeLimit),
    pos: String(pos || ""),
    locale,
    contentfilter: contentFilter,
    media_filter: "gif,tinygif,mediumgif",
  });

  return {
    count: Array.isArray(data.results) ? data.results.length : 0,
    next: data.next || "",
    results: Array.isArray(data.results)
      ? data.results.map(mapTenorResult)
      : [],
  };
};

export const getGifCategoriesService = async ({ locale = "en_US" } = {}) => {
  const data = await requestTenor("categories", { locale });

  const tags = Array.isArray(data.tags)
    ? data.tags.map((item) => ({
        searchTerm: item.searchterm || "",
        path: item.path || "",
        imageUrl: item.image || "",
        name: item.name || item.searchterm || "",
      }))
    : [];

  return {
    count: tags.length,
    categories: tags,
  };
};
