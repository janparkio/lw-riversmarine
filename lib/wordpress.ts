// Description: WordPress API functions
// Used to fetch data from a WordPress site using the WordPress REST API
// Types are imported from `wp.d.ts`

import querystring from "query-string";
import { defaultLocale, Locale } from "@/i18n/config";
import type {
  Post,
  Category,
  Tag,
  Page,
  Author,
  FeaturedMedia,
  Vessel,
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
  const query: Record<string, any> = {
    _embed: true,
    per_page: 100,
  };

  if (filterParams?.search) {
    query.search = filterParams.search;
  }
  if (filterParams?.category) {
    query.categories = filterParams.category;
  }

  return wordpressFetch<Vessel[]>("/wp-json/wp/v2/vessel", query, { locale });
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

export { WordPressAPIError };
