// Description: WordPress API functions
// Used to fetch data from a WordPress site using the WordPress REST API
// Types are imported from `wp.d.ts`

import querystring from "query-string";
import { defaultLocale, Locale, localeMap } from "@/i18n/config";
import type {
  Post,
  Category,
  Tag,
  Page,
  Author,
  FeaturedMedia,
  Vessel,
  MenuItem,
  ContactFormSubmissionPayload,
  ContactFormSubmissionResponse,
  ContactFormDetails,
} from "./wordpress.d";

const baseUrl = process.env.WORDPRESS_URL;

if (!baseUrl) {
  throw new Error("WORDPRESS_URL environment variable is not defined");
}

type FetchOptions = {
  locale?: Locale;
  cacheTags?: string[];
  includeLocaleParam?: boolean;
};

const defaultCacheTags = ["wordpress"];

const buildCacheTags = (cacheTags: string[] | undefined, locale: Locale) => {
  return Array.from(
    new Set([...(cacheTags ?? defaultCacheTags), `locale-${locale}`])
  );
};

const buildUrl = (
  path: string,
  query: Record<string, any> | undefined,
  locale: Locale,
  includeLocaleParam: boolean
) => {
  const queryWithLocale =
    includeLocaleParam && locale
      ? { ...(query || {}), lang: locale }
      : query || {};

  const queryString = Object.keys(queryWithLocale).length
    ? `?${querystring.stringify(queryWithLocale)}`
    : "";

  return `${baseUrl}${path}${queryString}`;
};

class WordPressAPIError extends Error {
  constructor(message: string, public status: number, public endpoint: string) {
    super(message);
    this.name = "WordPressAPIError";
  }
}

const contactFormDetailsCache = new Map<string, ContactFormDetails>();

async function getContactFormDetails(
  formId: string
): Promise<ContactFormDetails | null> {
  if (contactFormDetailsCache.has(formId)) {
    return contactFormDetailsCache.get(formId)!;
  }

  try {
    const response = await fetch(
      `${baseUrl}/wp-json/contact-form-7/v1/contact-forms/${formId}`,
      {
        cache: "no-store",
        headers: {
          "User-Agent": "Next.js WordPress Client",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ContactFormDetails;
    contactFormDetailsCache.set(formId, data);
    return data;
  } catch (error) {
    console.error("Failed to fetch Contact Form 7 details:", error);
    return null;
  }
}

// New types for pagination support
export interface WordPressPaginationHeaders {
  total: number;
  totalPages: number;
}

export interface WordPressResponse<T> {
  data: T;
  headers: WordPressPaginationHeaders;
}

// Keep original function for backward compatibility
async function wordpressFetch<T>(
  path: string,
  query?: Record<string, any>,
  options?: FetchOptions
): Promise<T> {
  const locale = options?.locale ?? defaultLocale;
  const includeLocaleParam = options?.includeLocaleParam ?? true;
  const url = buildUrl(path, query, locale, includeLocaleParam);
  const userAgent = "Next.js WordPress Client";

  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
    },
    next: {
      tags: buildCacheTags(options?.cacheTags, locale),
      revalidate: 3600, // 1 hour cache
    },
  });

  if (!response.ok) {
    throw new WordPressAPIError(
      `WordPress API request failed: ${response.statusText}`,
      response.status,
      url
    );
  }

  return response.json();
}

// New function for paginated requests
async function wordpressFetchWithPagination<T>(
  path: string,
  query?: Record<string, any>,
  options?: FetchOptions
): Promise<WordPressResponse<T>> {
  const locale = options?.locale ?? defaultLocale;
  const includeLocaleParam = options?.includeLocaleParam ?? true;
  const url = buildUrl(path, query, locale, includeLocaleParam);
  const userAgent = "Next.js WordPress Client";

  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
    },
    next: {
      tags: buildCacheTags(options?.cacheTags, locale),
      revalidate: 3600, // 1 hour cache
    },
  });

  if (!response.ok) {
    throw new WordPressAPIError(
      `WordPress API request failed: ${response.statusText}`,
      response.status,
      url
    );
  }

  const data = await response.json();

  return {
    data,
    headers: {
      total: parseInt(response.headers.get("X-WP-Total") || "0", 10),
      totalPages: parseInt(response.headers.get("X-WP-TotalPages") || "0", 10),
    },
  };
}

// New function for paginated posts
export async function getPostsPaginated(
  page: number = 1,
  perPage: number = 9,
  filterParams?: {
    author?: string;
    tag?: string;
    category?: string;
    search?: string;
  },
  locale: Locale = defaultLocale
): Promise<WordPressResponse<Post[]>> {
  const query: Record<string, any> = {
    _embed: true,
    per_page: perPage,
    page,
  };

  // Build cache tags based on filters
  const cacheTags = ["wordpress", "posts"];

  if (filterParams?.search) {
    query.search = filterParams.search;
    cacheTags.push("posts-search");
  }
  if (filterParams?.author) {
    query.author = filterParams.author;
    cacheTags.push(`posts-author-${filterParams.author}`);
  }
  if (filterParams?.tag) {
    query.tags = filterParams.tag;
    cacheTags.push(`posts-tag-${filterParams.tag}`);
  }
  if (filterParams?.category) {
    query.categories = filterParams.category;
    cacheTags.push(`posts-category-${filterParams.category}`);
  }

  // Add page-specific cache tag for granular invalidation
  cacheTags.push(`posts-page-${page}`);

  return wordpressFetchWithPagination<Post[]>(
    "/wp-json/wp/v2/posts",
    query,
    {
      locale,
      cacheTags,
    }
  );
}

export async function getAllPosts(
  filterParams?: {
    author?: string;
    tag?: string;
    category?: string;
    search?: string;
  },
  locale: Locale = defaultLocale
): Promise<Post[]> {
  const query: Record<string, any> = {
    _embed: true,
    per_page: 100,
  };

  if (filterParams?.search) {
    query.search = filterParams.search;

    if (filterParams?.author) {
      query.author = filterParams.author;
    }
    if (filterParams?.tag) {
      query.tags = filterParams.tag;
    }
    if (filterParams?.category) {
      query.categories = filterParams.category;
    }
  } else {
    if (filterParams?.author) {
      query.author = filterParams.author;
    }
    if (filterParams?.tag) {
      query.tags = filterParams.tag;
    }
    if (filterParams?.category) {
      query.categories = filterParams.category;
    }
  }

  return wordpressFetch<Post[]>("/wp-json/wp/v2/posts", query, { locale });
}

export async function getPostById(
  id: number,
  locale: Locale = defaultLocale
): Promise<Post> {
  return wordpressFetch<Post>(`/wp-json/wp/v2/posts/${id}`, undefined, {
    locale,
  });
}

export async function getPostBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<Post | undefined> {
  return wordpressFetch<Post[]>(
    "/wp-json/wp/v2/posts",
    { slug },
    { locale }
  ).then((posts) => posts[0]);
}

export async function getAllCategories(
  locale: Locale = defaultLocale
): Promise<Category[]> {
  return wordpressFetch<Category[]>("/wp-json/wp/v2/categories", undefined, {
    locale,
  });
}

export async function getCategoryById(
  id: number,
  locale: Locale = defaultLocale
): Promise<Category> {
  return wordpressFetch<Category>(
    `/wp-json/wp/v2/categories/${id}`,
    undefined,
    { locale }
  );
}

export async function getCategoryBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<Category> {
  return wordpressFetch<Category[]>(
    "/wp-json/wp/v2/categories",
    { slug },
    { locale }
  ).then((categories) => categories[0]);
}

export async function getPostsByCategory(
  categoryId: number,
  locale: Locale = defaultLocale
): Promise<Post[]> {
  return wordpressFetch<Post[]>(
    "/wp-json/wp/v2/posts",
    {
      categories: categoryId,
    },
    { locale }
  );
}

export async function getPostsByTag(
  tagId: number,
  locale: Locale = defaultLocale
): Promise<Post[]> {
  return wordpressFetch<Post[]>(
    "/wp-json/wp/v2/posts",
    { tags: tagId },
    { locale }
  );
}

export async function getTagsByPost(
  postId: number,
  locale: Locale = defaultLocale
): Promise<Tag[]> {
  return wordpressFetch<Tag[]>(
    "/wp-json/wp/v2/tags",
    { post: postId },
    { locale }
  );
}

export async function getAllTags(
  locale: Locale = defaultLocale
): Promise<Tag[]> {
  return wordpressFetch<Tag[]>("/wp-json/wp/v2/tags", undefined, { locale });
}

export async function getTagById(
  id: number,
  locale: Locale = defaultLocale
): Promise<Tag> {
  return wordpressFetch<Tag>(`/wp-json/wp/v2/tags/${id}`, undefined, {
    locale,
  });
}

export async function getTagBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<Tag> {
  return wordpressFetch<Tag[]>(
    "/wp-json/wp/v2/tags",
    { slug },
    { locale }
  ).then((tags) => tags[0]);
}

export async function getAllPages(
  locale: Locale = defaultLocale
): Promise<Page[]> {
  return wordpressFetch<Page[]>("/wp-json/wp/v2/pages", undefined, { locale });
}

export async function getPageById(
  id: number,
  locale: Locale = defaultLocale
): Promise<Page> {
  return wordpressFetch<Page>(`/wp-json/wp/v2/pages/${id}`, undefined, {
    locale,
  });
}

export async function getPageBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<Page | undefined> {
  return wordpressFetch<Page[]>(
    "/wp-json/wp/v2/pages",
    { slug },
    { locale }
  ).then((pages) => pages[0]);
}

export async function getAllAuthors(
  locale: Locale = defaultLocale
): Promise<Author[]> {
  return wordpressFetch<Author[]>("/wp-json/wp/v2/users", undefined, {
    locale,
  });
}

export async function getAuthorById(
  id: number,
  locale: Locale = defaultLocale
): Promise<Author> {
  return wordpressFetch<Author>(`/wp-json/wp/v2/users/${id}`, undefined, {
    locale,
  });
}

export async function getAuthorBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<Author> {
  return wordpressFetch<Author[]>(
    "/wp-json/wp/v2/users",
    { slug },
    { locale }
  ).then((users) => users[0]);
}

export async function getPostsByAuthor(
  authorId: number,
  locale: Locale = defaultLocale
): Promise<Post[]> {
  return wordpressFetch<Post[]>(
    "/wp-json/wp/v2/posts",
    { author: authorId },
    { locale }
  );
}

export async function getPostsByAuthorSlug(
  authorSlug: string,
  locale: Locale = defaultLocale
): Promise<Post[]> {
  const author = await getAuthorBySlug(authorSlug, locale);
  return wordpressFetch<Post[]>(
    "/wp-json/wp/v2/posts",
    { author: author.id },
    { locale }
  );
}

export async function getPostsByCategorySlug(
  categorySlug: string,
  locale: Locale = defaultLocale
): Promise<Post[]> {
  const category = await getCategoryBySlug(categorySlug, locale);
  return wordpressFetch<Post[]>(
    "/wp-json/wp/v2/posts",
    {
      categories: category.id,
    },
    { locale }
  );
}

export async function getPostsByTagSlug(
  tagSlug: string,
  locale: Locale = defaultLocale
): Promise<Post[]> {
  const tag = await getTagBySlug(tagSlug, locale);
  return wordpressFetch<Post[]>(
    "/wp-json/wp/v2/posts",
    { tags: tag.id },
    { locale }
  );
}

export async function getFeaturedMediaById(
  id: number,
  locale: Locale = defaultLocale
): Promise<FeaturedMedia> {
  return wordpressFetch<FeaturedMedia>(
    `/wp-json/wp/v2/media/${id}`,
    undefined,
    {
      locale,
      includeLocaleParam: false,
    }
  );
}

export async function searchCategories(
  query: string,
  locale: Locale = defaultLocale
): Promise<Category[]> {
  return wordpressFetch<Category[]>(
    "/wp-json/wp/v2/categories",
    {
      search: query,
      per_page: 100,
    },
    { locale }
  );
}

export async function searchTags(
  query: string,
  locale: Locale = defaultLocale
): Promise<Tag[]> {
  return wordpressFetch<Tag[]>(
    "/wp-json/wp/v2/tags",
    {
      search: query,
      per_page: 100,
    },
    { locale }
  );
}

export async function searchAuthors(
  query: string,
  locale: Locale = defaultLocale
): Promise<Author[]> {
  return wordpressFetch<Author[]>(
    "/wp-json/wp/v2/users",
    {
      search: query,
      per_page: 100,
    },
    { locale }
  );
}

// Function specifically for generateStaticParams - fetches ALL posts
export async function getAllPostSlugs(
  locale: Locale = defaultLocale
): Promise<{ slug: string }[]> {
  const allSlugs: { slug: string }[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await wordpressFetchWithPagination<Post[]>(
      "/wp-json/wp/v2/posts",
      {
        per_page: 100,
        page,
        _fields: "slug", // Only fetch slug field for performance
      },
      { locale }
    );

    const posts = response.data;
    allSlugs.push(...posts.map((post) => ({ slug: post.slug })));

    hasMore = page < response.headers.totalPages;
    page++;
  }

  return allSlugs;
}

// Enhanced pagination functions for specific queries
export async function getPostsByCategoryPaginated(
  categoryId: number,
  page: number = 1,
  perPage: number = 9,
  locale: Locale = defaultLocale
): Promise<WordPressResponse<Post[]>> {
  const query = {
    _embed: true,
    per_page: perPage,
    page,
    categories: categoryId,
  };

  return wordpressFetchWithPagination<Post[]>(
    "/wp-json/wp/v2/posts",
    query,
    { locale }
  );
}

export async function getPostsByTagPaginated(
  tagId: number,
  page: number = 1,
  perPage: number = 9,
  locale: Locale = defaultLocale
): Promise<WordPressResponse<Post[]>> {
  const query = {
    _embed: true,
    per_page: perPage,
    page,
    tags: tagId,
  };

  return wordpressFetchWithPagination<Post[]>(
    "/wp-json/wp/v2/posts",
    query,
    { locale }
  );
}

export async function getPostsByAuthorPaginated(
  authorId: number,
  page: number = 1,
  perPage: number = 9,
  locale: Locale = defaultLocale
): Promise<WordPressResponse<Post[]>> {
  const query = {
    _embed: true,
    per_page: perPage,
    page,
    author: authorId,
  };

  return wordpressFetchWithPagination<Post[]>(
    "/wp-json/wp/v2/posts",
    query,
    { locale }
  );
}

// ============================================================================
// Vessel Functions
// ============================================================================

export async function getVesselsPaginated(
  page: number = 1,
  perPage: number = 9,
  filterParams?: {
    category?: string;
    search?: string;
  },
  locale: Locale = defaultLocale
): Promise<WordPressResponse<Vessel[]>> {
  const query: Record<string, any> = {
    _embed: true,
    per_page: perPage,
    page,
  };

  // Build cache tags based on filters
  const cacheTags = ["wordpress", "vessels"];

  if (filterParams?.search) {
    query.search = filterParams.search;
    cacheTags.push("vessels-search");
  }
  if (filterParams?.category) {
    query.categories = filterParams.category;
    cacheTags.push(`vessels-category-${filterParams.category}`);
  }

  // Add page-specific cache tag for granular invalidation
  cacheTags.push(`vessels-page-${page}`);

  return wordpressFetchWithPagination<Vessel[]>(
    "/wp-json/wp/v2/vessel",
    query,
    {
      locale,
      cacheTags,
    }
  );
}

export async function getAllVessels(
  filterParams?: {
    category?: string;
    search?: string;
  },
  locale: Locale = defaultLocale
): Promise<Vessel[]> {
  const perPage = 100;
  const allVessels: Vessel[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const query: Record<string, any> = {
      _embed: true,
      per_page: perPage,
      page,
    };

    if (filterParams?.search) {
      query.search = filterParams.search;
    }
    if (filterParams?.category) {
      query.categories = filterParams.category;
    }

    const response = await wordpressFetchWithPagination<Vessel[]>(
      "/wp-json/wp/v2/vessel",
      query,
      { locale }
    );

    allVessels.push(...response.data);
    hasMore = page < response.headers.totalPages;
    page++;
  }

  return allVessels;
}

export async function getVesselById(
  id: number,
  locale: Locale = defaultLocale
): Promise<Vessel> {
  return wordpressFetch<Vessel>(`/wp-json/wp/v2/vessel/${id}`, undefined, {
    locale,
  });
}

export async function getVesselBySlug(
  slug: string,
  locale: Locale = defaultLocale
): Promise<Vessel | undefined> {
  return wordpressFetch<Vessel[]>(
    "/wp-json/wp/v2/vessel",
    { slug },
    { locale }
  ).then((vessels) => vessels[0]);
}

export async function getAllVesselSlugs(
  locale: Locale = defaultLocale
): Promise<{ slug: string }[]> {
  const allSlugs: { slug: string }[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await wordpressFetchWithPagination<Vessel[]>(
      "/wp-json/wp/v2/vessel",
      {
        per_page: 100,
        page,
        _fields: "slug", // Only fetch slug field for performance
      },
      { locale }
    );

    const vessels = response.data;
    allSlugs.push(...vessels.map((vessel) => ({ slug: vessel.slug })));

    hasMore = page < response.headers.totalPages;
    page++;
  }

  return allSlugs;
}

export async function getVesselsByCategoryPaginated(
  categoryId: number,
  page: number = 1,
  perPage: number = 9,
  locale: Locale = defaultLocale
): Promise<WordPressResponse<Vessel[]>> {
  const query = {
    _embed: true,
    per_page: perPage,
    page,
    categories: categoryId,
  };

  return wordpressFetchWithPagination<Vessel[]>(
    "/wp-json/wp/v2/vessel",
    query,
    { locale }
  );
}

// ============================================================================
// Menu Functions
// ============================================================================

type MenuApiResponse = {
  items?: MenuApiItem[];
} | MenuApiItem[] | null;

type MenuApiItem = {
  id?: number | string;
  ID?: number | string;
  object_id?: number | string;
  parent?: number | string | null;
  menu_item_parent?: number | string | null;
  menu_order?: number | string | null;
  title?:
    | string
    | null
    | {
        rendered?: string | null;
      };
  name?: string | null;
  url?: string | null;
  target?: string | null;
  xfn?: string[] | string | null;
  child_items?: MenuApiItem[] | null;
  children?: MenuApiItem[] | null;
};

const menuEndpointBuilders: Array<(location: string) => string> = [
  (location: string) => `/wp-json/wp-api-menus/v2/menu-locations/${location}`,
  (location: string) => `/wp-json/menus/v1/menus/${location}`,
];

let menuItemIdCounter = 0;

export async function getMenuByLocation(
  location: string,
  locale: Locale = defaultLocale
): Promise<MenuItem[] | null> {
  const cacheTags = ["wordpress", "menus", `menu-${location}`];

  for (const buildPath of menuEndpointBuilders) {
    try {
      const response = await wordpressFetch<MenuApiResponse>(
        buildPath(location),
        undefined,
        {
          locale,
          cacheTags,
        }
      );

      const normalized = normalizeMenuResponse(response);
      if (normalized.length) {
        return normalized;
      }
    } catch (error) {
      console.warn(
        `Failed to load WordPress menu for location "${location}" via ${buildPath(
          location
        )}: ${(error as Error).message}`
      );
    }
  }

  return null;
}

function normalizeMenuResponse(response: MenuApiResponse): MenuItem[] {
  menuItemIdCounter = 0;

  if (!response) {
    return [];
  }

  const items = Array.isArray(response)
    ? response
    : Array.isArray(response.items)
      ? response.items
      : [];

  if (!items.length) {
    return [];
  }

  const flatItems = flattenMenuItems(items);
  return buildMenuTree(flatItems);
}

type FlatMenuItem = Omit<MenuItem, "children">;

function flattenMenuItems(
  items: MenuApiItem[],
  parentId: string | null = null
): FlatMenuItem[] {
  const flat: FlatMenuItem[] = [];

  items.forEach((item, index) => {
    const normalized = normalizeMenuItem(item, parentId, index);
    flat.push(normalized);

    const nested =
      Array.isArray(item.child_items) && item.child_items.length
        ? item.child_items
        : Array.isArray(item.children)
          ? item.children
          : [];

    if (nested.length) {
      flat.push(...flattenMenuItems(nested, normalized.id));
    }
  });

  return flat;
}

function normalizeMenuItem(
  item: MenuApiItem,
  explicitParentId: string | null,
  fallbackOrder: number
): FlatMenuItem {
  const id = coerceMenuItemId(item.id ?? item.ID ?? item.object_id);
  const parentId =
    explicitParentId ??
    coerceParentId(item.menu_item_parent ?? item.parent);
  const order =
    coerceToNumber(item.menu_order) ?? Math.max(fallbackOrder, 0) ?? 0;

  const labelSource =
    typeof item.title === "string"
      ? item.title
      : item.title?.rendered ?? item.name ?? "";

  const label = stripHtml(labelSource).trim() || "Menu Item";
  const href = (item.url ?? "").trim() || "/";
  const rel =
    Array.isArray(item.xfn) && item.xfn.length
      ? item.xfn.filter(Boolean).join(" ")
      : typeof item.xfn === "string"
        ? item.xfn
        : null;
  const target =
    typeof item.target === "string" && item.target.trim().length
      ? item.target
      : null;

  return {
    id,
    parentId,
    order,
    label,
    href,
    target,
    rel,
  };
}

function coerceMenuItemId(value: number | string | undefined): string {
  if (typeof value === "number" || (typeof value === "string" && value)) {
    return String(value);
  }

  menuItemIdCounter += 1;
  return `menu-item-${menuItemIdCounter}`;
}

function coerceParentId(
  value: number | string | null | undefined
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value);
  return normalized === "0" || normalized === "" ? null : normalized;
}

function coerceToNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function buildMenuTree(items: FlatMenuItem[]): MenuItem[] {
  const lookup = new Map<string, MenuItem>();
  const roots: MenuItem[] = [];

  items.forEach((item) => {
    lookup.set(item.id, { ...item, children: [] });
  });

  lookup.forEach((item) => {
    if (item.parentId && lookup.has(item.parentId)) {
      lookup.get(item.parentId)!.children.push(item);
    } else {
      roots.push(item);
    }
  });

  return sortMenuItems(roots);
}

function sortMenuItems(items: MenuItem[]): MenuItem[] {
  return items
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      ...item,
      children: item.children.length ? sortMenuItems(item.children) : [],
    }));
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

export async function submitContactForm(
  formId: string,
  payload: ContactFormSubmissionPayload
): Promise<ContactFormSubmissionResponse> {
  const url = `${baseUrl}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;
  const formData = new FormData();
  const details = await getContactFormDetails(formId);
  const fallbackLocale =
    localeMap[defaultLocale]?.replace("-", "_") || "en_US";
  const locale = payload.locale || details?.locale || fallbackLocale;
  const version = details?.version || "";
  const unitTag = `wpcf7-f${formId}-p0-o1`;

  formData.append("_wpcf7", formId);
  formData.append("_wpcf7_version", version);
  formData.append("_wpcf7_locale", locale);
  formData.append("_wpcf7_unit_tag", unitTag);
  formData.append("_wpcf7_container_post", "0");
  formData.append("_wpcf7_posted_data_hash", "");

  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("message", payload.message);

  if (payload.phone) {
    formData.append("tel", payload.phone);
  }

  if (payload.vesselTitle) {
    formData.append("vessel_title", payload.vesselTitle);
  }

  if (payload.pageUrl) {
    formData.append("page_url", payload.pageUrl);
  }

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": "Next.js WordPress Client",
    },
    cache: "no-store",
  });

  let data: ContactFormSubmissionResponse | Record<string, any> | null = null;
  try {
    data = await response.json();
  } catch {
    // ignore JSON parse errors to preserve original response
  }

  if (!response.ok) {
    const error = new WordPressAPIError(
      (data as ContactFormSubmissionResponse | undefined)?.message ||
        `WordPress API request failed: ${response.statusText}`,
      response.status,
      url
    );

    (error as WordPressAPIError & { details?: unknown }).details = data;
    throw error;
  }

  return (data as ContactFormSubmissionResponse) || {
    into: "",
    message: "Unknown response from WordPress.",
    status: "unknown",
  };
}

export { WordPressAPIError };
