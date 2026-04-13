export class GifServiceError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "GifServiceError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const GIPHY_BASE_URL = "https://api.giphy.com/v1";

const parsePositiveInt = (value, fallback) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

const parseNonNegativeInt = (value, fallback) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
};

const normalizeLocaleToLang = (locale = "en_US") => {
  const normalized = String(locale).trim();
  if (!normalized) return "en";
  return normalized.split(/[_-]/)[0]?.toLowerCase() || "en";
};

const mapContentFilterToRating = (contentFilter = "off") => {
  const normalized = String(contentFilter).trim().toLowerCase();
  if (normalized === "high") return "g";
  if (normalized === "medium") return "pg";
  if (normalized === "low") return "pg-13";
  return "";
};

const getGiphyApiKey = () => {
  const key =
    process.env.GIPHY_API_KEY ||
    process.env.GIF_API_KEY ||
    process.env.TENOR_API_KEY;
  if (!key) {
    throw new GifServiceError(
      "GIPHY_API_KEY is required for GIF search service",
      500,
    );
  }
  return key;
};

const pickPreviewImage = (images = {}) =>
  images.fixed_width_small ||
  images.fixed_width_downsampled ||
  images.fixed_width ||
  images.downsized_small ||
  images.original ||
  {};

const pickShareImage = (images = {}) =>
  images.original || images.fixed_width || images.downsized || {};

const toSafeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const inferTags = (item = {}) => {
  const rawSlug = String(item.slug || "")
    .trim()
    .toLowerCase();
  if (!rawSlug) return [];
  return rawSlug
    .split("-")
    .map((tag) => tag.trim())
    .filter((tag) => tag && tag !== "giphy");
};

const mapGiphyResult = (item = {}) => {
  const images = item.images || {};
  const preview = pickPreviewImage(images);
  const share = pickShareImage(images);
  const previewUrl =
    preview.webp || preview.url || share.webp || share.url || "";
  const shareUrl = share.url || share.webp || preview.url || preview.webp || "";

  return {
    id: item.id || "",
    title: item.title || "",
    url: shareUrl,
    previewUrl,
    width: toSafeNumber(share.width || preview.width),
    height: toSafeNumber(share.height || preview.height),
    durationSeconds: 0,
    tags: inferTags(item),
  };
};

const requestGiphy = async (path, params = {}) => {
  const apiKey = getGiphyApiKey();
  const searchParams = new URLSearchParams();
  searchParams.set("api_key", apiKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (typeof value === "string" && value.trim() === "") return;
    searchParams.set(key, String(value));
  });

  const url = `${GIPHY_BASE_URL}/${path}?${searchParams.toString()}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    let providerMessage = "";
    try {
      const errorPayload = await response.json();
      providerMessage =
        errorPayload?.message ||
        errorPayload?.meta?.msg ||
        errorPayload?.meta?.error_type ||
        "";
    } catch {
      // Ignore parse errors and fallback to generic status message.
    }

    throw new GifServiceError(
      providerMessage
        ? `GIF provider request failed (${response.status}): ${providerMessage}`
        : `GIF provider request failed with status ${response.status}`,
      response.status,
      { provider: "giphy", status: response.status, path },
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
  const safeOffset = parseNonNegativeInt(pos, 0);
  const lang = normalizeLocaleToLang(locale);
  const rating = mapContentFilterToRating(contentFilter);

  const data = await requestGiphy("gifs/search", {
    q: trimmedQuery,
    limit: String(safeLimit),
    offset: String(safeOffset),
    lang,
    rating,
  });

  const results = Array.isArray(data.data) ? data.data.map(mapGiphyResult) : [];
  const count = results.length;
  const offset = toSafeNumber(data?.pagination?.offset);
  const total = toSafeNumber(data?.pagination?.total_count);
  const nextOffset = offset + count;

  return {
    query: trimmedQuery,
    count,
    next: total > nextOffset ? String(nextOffset) : "",
    results,
  };
};

export const getTrendingGifsService = async ({
  limit = 20,
  pos = "",
  locale = "en_US",
  contentFilter = "off",
} = {}) => {
  const safeLimit = Math.min(parsePositiveInt(limit, 20), 50);
  const safeOffset = parseNonNegativeInt(pos, 0);
  const lang = normalizeLocaleToLang(locale);
  const rating = mapContentFilterToRating(contentFilter);

  const data = await requestGiphy("gifs/trending", {
    limit: String(safeLimit),
    offset: String(safeOffset),
    lang,
    rating,
  });

  const results = Array.isArray(data.data) ? data.data.map(mapGiphyResult) : [];
  const count = results.length;
  const offset = toSafeNumber(data?.pagination?.offset);
  const total = toSafeNumber(data?.pagination?.total_count);
  const nextOffset = offset + count;

  return {
    count,
    next: total > nextOffset ? String(nextOffset) : "",
    results,
  };
};

export const searchStickersService = async ({
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
  const safeOffset = parseNonNegativeInt(pos, 0);
  const lang = normalizeLocaleToLang(locale);
  const rating = mapContentFilterToRating(contentFilter);

  const data = await requestGiphy("stickers/search", {
    q: trimmedQuery,
    limit: String(safeLimit),
    offset: String(safeOffset),
    lang,
    rating,
  });

  const results = Array.isArray(data.data) ? data.data.map(mapGiphyResult) : [];
  const count = results.length;
  const offset = toSafeNumber(data?.pagination?.offset);
  const total = toSafeNumber(data?.pagination?.total_count);
  const nextOffset = offset + count;

  return {
    query: trimmedQuery,
    count,
    next: total > nextOffset ? String(nextOffset) : "",
    results,
  };
};

export const getTrendingStickersService = async ({
  limit = 20,
  pos = "",
  locale = "en_US",
  contentFilter = "off",
} = {}) => {
  const safeLimit = Math.min(parsePositiveInt(limit, 20), 50);
  const safeOffset = parseNonNegativeInt(pos, 0);
  const lang = normalizeLocaleToLang(locale);
  const rating = mapContentFilterToRating(contentFilter);

  const data = await requestGiphy("stickers/trending", {
    limit: String(safeLimit),
    offset: String(safeOffset),
    lang,
    rating,
  });

  const results = Array.isArray(data.data) ? data.data.map(mapGiphyResult) : [];
  const count = results.length;
  const offset = toSafeNumber(data?.pagination?.offset);
  const total = toSafeNumber(data?.pagination?.total_count);
  const nextOffset = offset + count;

  return {
    count,
    next: total > nextOffset ? String(nextOffset) : "",
    results,
  };
};

export const getGifCategoriesService = async ({ locale = "en_US" } = {}) => {
  try {
    const lang = normalizeLocaleToLang(locale);
    const data = await requestGiphy("gifs/categories", {
      lang,
    });

    const categories = Array.isArray(data.data)
      ? data.data.map((item) => {
          const imageUrl =
            item?.gif?.images?.fixed_width_small_still?.url ||
            item?.gif?.images?.original_still?.url ||
            "";
          const name = String(item?.name || "").trim();
          const searchTerm = name.toLowerCase();

          return {
            searchTerm,
            path: searchTerm,
            imageUrl,
            name,
          };
        })
      : [];

    return {
      count: categories.length,
      categories,
    };
  } catch (error) {
    if (
      error instanceof GifServiceError &&
      [403, 404].includes(error.statusCode)
    ) {
      return {
        count: 0,
        categories: [],
      };
    }
    throw error;
  }
};
