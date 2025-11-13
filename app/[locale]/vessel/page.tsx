import {
  getVesselsPaginated,
  getAllCategories,
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
import { VesselCard } from "@/components/vessels/vessel-card";
import { FilterVessels } from "@/components/vessels/filter";
import { SearchInput } from "@/components/vessels/search-input";

import { Locale, withLocalePath } from "@/i18n/config";
import { getTranslator } from "@/lib/i18n";
import { partitionEntitiesByLocale } from "@/lib/polylang";
import { TranslationFallback } from "@/components/language/translation-fallback";
import { LanguageAlternatesScript } from "@/components/language/language-alternates-script";
import { buildStaticAlternates } from "@/lib/polylang";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vessel Listings",
  description: "Browse all our vessel listings",
};

export const dynamic = "auto";
export const revalidate = 600;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    category?: string;
    page?: string;
    search?: string;
  }>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const { category, page: pageParam, search } = resolvedSearchParams;
  const t = await getTranslator(locale);

  // Handle pagination
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const vesselsPerPage = 9;
  const filterParams = new URLSearchParams();
  if (category) filterParams.set("category", category);
  if (search) filterParams.set("search", search);
  if (page > 1) filterParams.set("page", page.toString());
  const filterQuery = filterParams.toString();
  const alternates = buildStaticAlternates((entryLocale) =>
    withLocalePath(
      entryLocale,
      `/vessel${filterQuery ? `?${filterQuery}` : ""}`
    )
  );

  // Fetch data based on search parameters using efficient pagination
  const [vesselsResponse, categories] = await Promise.all([
    getVesselsPaginated(page, vesselsPerPage, { category, search }, locale),
    search ? searchCategories(search, locale) : getAllCategories(locale),
  ]);

  const { data: vessels, headers } = vesselsResponse;
  const { matches: localizedVessels, fallbacks: fallbackVessels } =
    partitionEntitiesByLocale(vessels, locale);
  const localizedCount = localizedVessels.length;
  const { totalPages } = headers;
  const suffixText = search ? t("vessels.list.count.suffix") : "";
  const countKey =
    localizedCount === 1
      ? "vessels.list.count.single"
      : "vessels.list.count.plural";
  const countText = t(countKey, { count: localizedCount, suffix: suffixText });

  // Create pagination URL helper
  const createPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", newPage.toString());
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    return withLocalePath(
      locale,
      `/vessel${params.toString() ? `?${params.toString()}` : ""}`
    );
  };

  return (
    <>
      <LanguageAlternatesScript alternates={alternates} activeLocale={locale} />
      <section className="pt-0">
        <Container>
          <div className="space-y-8">
          <Prose>
            <h2>{t("vessels.list.heading")}</h2>
            <p className="text-muted-foreground">{countText}</p>
          </Prose>

          <div className="space-y-4">
            <SearchInput
              defaultValue={search}
              placeholder={t("search.placeholder.vessels")}
            />

            <FilterVessels
              categories={categories}
              selectedCategory={category}
              labels={{
                categories: t("vessels.filters.categories"),
                reset: t("vessels.filters.reset"),
              }}
            />
          </div>

          {fallbackVessels.length > 0 && (
            <TranslationFallback
              title={t("vessels.list.fallback.title")}
              description={t("vessels.list.fallback.description", {
                count: fallbackVessels.length,
              })}
            />
          )}

          {localizedVessels.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {localizedVessels.map((vessel) => (
                <VesselCard key={vessel.id} vessel={vessel} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="h-24 w-full border rounded-lg bg-accent/25 flex items-center justify-center">
              <p>{t("vessels.list.empty")}</p>
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
      </section>
    </>
  );
}
