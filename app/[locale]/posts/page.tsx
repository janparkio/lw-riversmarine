import {
  getPostsPaginated,
  getAllAuthors,
  getAllTags,
  getAllCategories,
  searchAuthors,
  searchTags,
  searchCategories,
} from "@/lib/wordpress";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Section, Container, Prose } from "@/components/craft";
import { PostCard } from "@/components/posts/post-card";
import { FilterPosts } from "@/components/posts/filter";
import { SearchInput } from "@/components/posts/search-input";

import { Locale, withLocalePath } from "@/i18n/config";
import { getTranslator } from "@/lib/i18n";
import { LanguageAlternatesScript } from "@/components/language/language-alternates-script";
import { buildStaticAlternates } from "@/lib/polylang";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Posts",
  description: "Browse all our blog posts",
};

export const dynamic = "auto";
export const revalidate = 600;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    author?: string;
    tag?: string;
    category?: string;
    page?: string;
    search?: string;
  }>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const { author, tag, category, page: pageParam, search } = resolvedSearchParams;
  const t = await getTranslator(locale);

  // Handle pagination
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const postsPerPage = 9;
  const filterParams = new URLSearchParams();
  if (category) filterParams.set("category", category);
  if (author) filterParams.set("author", author);
  if (tag) filterParams.set("tag", tag);
  if (search) filterParams.set("search", search);
  if (page > 1) filterParams.set("page", page.toString());
  const filterQuery = filterParams.toString();
  const alternates = buildStaticAlternates((entryLocale) =>
    withLocalePath(
      entryLocale,
      `/posts${filterQuery ? `?${filterQuery}` : ""}`
    )
  );

  // Fetch data based on search parameters using efficient pagination
  const [postsResponse, authors, tags, categories] = await Promise.all([
    getPostsPaginated(page, postsPerPage, { author, tag, category, search }, locale),
    search ? searchAuthors(search, locale) : getAllAuthors(locale),
    search ? searchTags(search, locale) : getAllTags(locale),
    search ? searchCategories(search, locale) : getAllCategories(locale),
  ]);

  const { data: posts, headers } = postsResponse;
  const { total, totalPages } = headers;
  const suffixText = search ? t("posts.list.count.suffix") : "";
  const countKey =
    total === 1 ? "posts.list.count.single" : "posts.list.count.plural";
  const countText = t(countKey, { count: total, suffix: suffixText });

  // Create pagination URL helper
  const createPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", newPage.toString());
    if (category) params.set("category", category);
    if (author) params.set("author", author);
    if (tag) params.set("tag", tag);
    if (search) params.set("search", search);
    return withLocalePath(
      locale,
      `/posts${params.toString() ? `?${params.toString()}` : ""}`
    );
  };

  return (
    <>
      <LanguageAlternatesScript alternates={alternates} activeLocale={locale} />
      <Section>
        <Container>
          <div className="space-y-8">
          <Prose>
            <h2>{t("posts.list.heading")}</h2>
            <p className="text-muted-foreground">{countText}</p>
          </Prose>

          <div className="space-y-4">
            <SearchInput
              defaultValue={search}
              placeholder={t("search.placeholder.posts")}
            />

            <FilterPosts
              authors={authors}
              tags={tags}
              categories={categories}
              selectedAuthor={author}
              selectedTag={tag}
              selectedCategory={category}
              labels={{
                tags: t("posts.filters.tags"),
                categories: t("posts.filters.categories"),
                authors: t("posts.filters.authors"),
                reset: t("posts.filters.reset"),
              }}
            />
          </div>

          {posts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="h-24 w-full border rounded-lg bg-accent/25 flex items-center justify-center">
              <p>{t("posts.list.empty")}</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center py-8">
              <Pagination>
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={createPaginationUrl(page - 1)}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((pageNum) => {
                      // Show current page, first page, last page, and 2 pages around current
                      return (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - page) <= 1
                      );
                    })
                    .map((pageNum, index, array) => {
                      const showEllipsis =
                        index > 0 && pageNum - array[index - 1] > 1;
                      return (
                        <div key={pageNum} className="flex items-center">
                          {showEllipsis && <span className="px-2">...</span>}
                          <PaginationItem>
                            <PaginationLink
                              href={createPaginationUrl(pageNum)}
                              isActive={pageNum === page}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        </div>
                      );
                    })}

                  {page < totalPages && (
                    <PaginationItem>
                      <PaginationNext href={createPaginationUrl(page + 1)} />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
          </div>
        </Container>
      </Section>
    </>
  );
}
