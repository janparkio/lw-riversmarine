import { getAllVessels } from "@/lib/wordpress";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Container, Prose } from "@/components/craft";
import { VesselCard } from "@/components/vessels/vessel-card";
import { FilterVessels } from "@/components/vessels/filter";
import { SearchInput } from "@/components/vessels/search-input";

import { Locale, withLocalePath } from "@/i18n/config";
import { getTranslator } from "@/lib/i18n";
import { partitionEntitiesByLocale } from "@/lib/polylang";
import { TranslationFallback } from "@/components/language/translation-fallback";
import { LanguageAlternatesScript } from "@/components/language/language-alternates-script";
import { buildStaticAlternates } from "@/lib/polylang";
import {
  buildVesselFilterMetadata,
  clampRangeToBounds,
  matchesVesselFilters,
  type VesselFilterValues,
  type RangeBounds,
} from "@/lib/vessel-filters";
import { vesselTypeLabels } from "@/lib/vessel";

import type { Metadata } from "next";
import type { Vessel, VesselType } from "@/lib/wordpress.d";

export const metadata: Metadata = {
  title: "Vessel Listings",
  description: "Browse all our vessel listings",
};

export const dynamic = "auto";
export const revalidate = 600;

type RangeState = {
  value: [number, number];
  active: boolean;
};

const vesselTypeKeys = Object.keys(vesselTypeLabels) as VesselType[];

const isVesselTypeValue = (value?: string): value is VesselType => {
  if (!value) return false;
  return vesselTypeKeys.includes(value as VesselType);
};

const parseNumberParam = (value?: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildRangeState = (
  minParam: string | undefined,
  maxParam: string | undefined,
  bounds?: RangeBounds
): RangeState | undefined => {
  if (!bounds) {
    return undefined;
  }

  const minValue = parseNumberParam(minParam) ?? bounds.min;
  const maxValue = parseNumberParam(maxParam) ?? bounds.max;
  const clamped = clampRangeToBounds(
    [Math.min(minValue, maxValue), Math.max(minValue, maxValue)],
    bounds
  );
  const active = clamped[0] > bounds.min || clamped[1] < bounds.max;
  return { value: clamped, active };
};

const buildSearchFilter = (term?: string) => {
  if (!term) {
    return (vessel: Vessel) => true;
  }

  const normalized = term.toLowerCase();
  return (vessel: Vessel) => {
    const title = vessel.title?.rendered?.toLowerCase() ?? "";
    const slug = vessel.slug?.toLowerCase() ?? "";
    const description = vessel.acf?.meta_description?.toLowerCase() ?? "";
    const content = vessel.content?.rendered?.toLowerCase() ?? "";
    return [title, slug, description, content].some((field) =>
      field.includes(normalized)
    );
  };
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    category?: string;
    vesselType?: string;
    bargeType?: string;
    page?: string;
    search?: string;
    yearMin?: string;
    yearMax?: string;
    hpMin?: string;
    hpMax?: string;
    priceMin?: string;
    priceMax?: string;
    lengthMin?: string;
    lengthMax?: string;
    propulsion?: string;
    fuelType?: string;
    hasPrice?: string;
  }>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const {
    category,
    vesselType: vesselTypeQuery,
    bargeType,
    page: pageParam,
    search,
    yearMin,
    yearMax,
    hpMin,
    hpMax,
    priceMin,
    priceMax,
    lengthMin,
    lengthMax,
    propulsion,
    fuelType,
    hasPrice,
  } = resolvedSearchParams;
  const t = await getTranslator(locale);

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const vesselsPerPage = 9;

  const allVessels = await getAllVessels(undefined, locale);
  const metadata = buildVesselFilterMetadata(allVessels);
  const filterRanges = metadata.ranges;

  const yearRangeState = buildRangeState(yearMin, yearMax, filterRanges.yearBuilt);
  const hpRangeState = buildRangeState(hpMin, hpMax, filterRanges.horsepower);
  const priceRangeState = buildRangeState(
    priceMin,
    priceMax,
    filterRanges.price
  );
  const lengthRangeState = buildRangeState(
    lengthMin,
    lengthMax,
    filterRanges.length
  );

  const hasPriceFilter = hasPrice === "true";
  const fuelTypeFilter = fuelType || undefined;
  const propulsionFilter = propulsion || undefined;

  let vesselTypeFilter: VesselType | undefined =
    isVesselTypeValue(vesselTypeQuery) ? vesselTypeQuery : undefined;
  let wpCategoryFilter: number | undefined;

  if (!vesselTypeFilter && isVesselTypeValue(category)) {
    vesselTypeFilter = category;
  } else if (category && /^\d+$/.test(category)) {
    wpCategoryFilter = Number(category);
  }

  const filters: VesselFilterValues = {
    vesselType: vesselTypeFilter,
    bargeType: vesselTypeFilter === "barge" ? bargeType || undefined : undefined,
    propulsion: propulsionFilter,
    fuelType: fuelTypeFilter,
    hasPrice: hasPriceFilter,
    wpCategoryId: wpCategoryFilter,
  };

  if (yearRangeState?.active) {
    filters.minYear = yearRangeState.value[0];
    filters.maxYear = yearRangeState.value[1];
  }
  if (hpRangeState?.active) {
    filters.minHp = hpRangeState.value[0];
    filters.maxHp = hpRangeState.value[1];
  }
  if (priceRangeState?.active) {
    filters.minPrice = priceRangeState.value[0];
    filters.maxPrice = priceRangeState.value[1];
  }
  if (lengthRangeState?.active) {
    filters.minLength = lengthRangeState.value[0];
    filters.maxLength = lengthRangeState.value[1];
  }

  const searchFilter = buildSearchFilter(search?.trim());
  const filteredVessels = allVessels
    .filter(searchFilter)
    .filter((vessel) => matchesVesselFilters(vessel, filters));

  const {
    matches: localizedVessels,
    fallbacks: fallbackVessels,
  } = partitionEntitiesByLocale(filteredVessels, locale);

  const totalPages = Math.max(
    1,
    Math.ceil(localizedVessels.length / vesselsPerPage)
  );
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const paginatedVessels = localizedVessels.slice(
    (currentPage - 1) * vesselsPerPage,
    currentPage * vesselsPerPage
  );

  const localizedCount = localizedVessels.length;
  const suffixText = search ? t("vessels.list.count.suffix") : "";
  const countKey =
    localizedCount === 1
      ? "vessels.list.count.single"
      : "vessels.list.count.plural";
  const countText = t(countKey, { count: localizedCount, suffix: suffixText });

  const buildFilterParams = (pageValue?: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (vesselTypeFilter) params.set("vesselType", vesselTypeFilter);
    if (bargeType && vesselTypeFilter === "barge") {
      params.set("bargeType", bargeType);
    }
    if (wpCategoryFilter) {
      params.set("category", wpCategoryFilter.toString());
    }
    if (propulsionFilter) params.set("propulsion", propulsionFilter);
    if (fuelTypeFilter) params.set("fuelType", fuelTypeFilter);
    if (hasPriceFilter) params.set("hasPrice", "true");

    if (yearRangeState) {
      if (yearRangeState.value[0] > (filterRanges.yearBuilt?.min ?? 0)) {
        params.set("yearMin", yearRangeState.value[0].toString());
      }
      if (yearRangeState.value[1] < (filterRanges.yearBuilt?.max ?? 0)) {
        params.set("yearMax", yearRangeState.value[1].toString());
      }
    }

    if (hpRangeState) {
      if (hpRangeState.value[0] > (filterRanges.horsepower?.min ?? 0)) {
        params.set("hpMin", hpRangeState.value[0].toString());
      }
      if (hpRangeState.value[1] < (filterRanges.horsepower?.max ?? 0)) {
        params.set("hpMax", hpRangeState.value[1].toString());
      }
    }

    if (priceRangeState) {
      if (priceRangeState.value[0] > (filterRanges.price?.min ?? 0)) {
        params.set("priceMin", priceRangeState.value[0].toString());
      }
      if (priceRangeState.value[1] < (filterRanges.price?.max ?? 0)) {
        params.set("priceMax", priceRangeState.value[1].toString());
      }
    }

    if (lengthRangeState) {
      if (lengthRangeState.value[0] > (filterRanges.length?.min ?? 0)) {
        params.set("lengthMin", lengthRangeState.value[0].toString());
      }
      if (lengthRangeState.value[1] < (filterRanges.length?.max ?? 0)) {
        params.set("lengthMax", lengthRangeState.value[1].toString());
      }
    }

    if (typeof pageValue === "number" && pageValue > 1) {
      params.set("page", pageValue.toString());
    }

    return params;
  };

  const filterQuery = buildFilterParams(currentPage).toString();
  const alternates = buildStaticAlternates((entryLocale) =>
    withLocalePath(
      entryLocale,
      `/vessel${filterQuery ? `?${filterQuery}` : ""}`
    )
  );

  const createPaginationUrl = (newPage: number) => {
    const params = buildFilterParams(newPage);
    return withLocalePath(
      locale,
      `/vessel${params.toString() ? `?${params.toString()}` : ""}`
    );
  };

  const initialRangeValue = (
    state: RangeState | undefined,
    bounds?: RangeBounds
  ): [number, number] | undefined => {
    if (state) return state.value;
    if (!bounds) return undefined;
    return [bounds.min, bounds.max];
  };

  const initialFilterValues = {
    vesselType: vesselTypeFilter,
    bargeType: vesselTypeFilter === "barge" ? bargeType || undefined : undefined,
    propulsion: propulsionFilter,
    fuelType: fuelTypeFilter,
    hasPrice: hasPriceFilter,
    yearRange: initialRangeValue(yearRangeState, filterRanges.yearBuilt),
    horsepowerRange: initialRangeValue(hpRangeState, filterRanges.horsepower),
    priceRange: initialRangeValue(priceRangeState, filterRanges.price),
    lengthRange: initialRangeValue(lengthRangeState, filterRanges.length),
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
                bounds={filterRanges}
                initialFilters={initialFilterValues}
                fuelOptions={metadata.fuelTypes}
                bargeOptions={metadata.bargeTypes}
                propulsionOptions={metadata.propulsionTypes}
                labels={{
                  apply: t("vessels.filters.apply"),
                  reset: t("vessels.filters.reset"),
                  advancedHeading: t("vessels.filters.advancedHeading"),
                  yearBuilt: t("vessels.filters.yearBuilt"),
                  horsepower: t("vessels.filters.horsepower"),
                  price: t("vessels.filters.price"),
                  length: t("vessels.filters.length"),
                  hasPrice: t("vessels.filters.hasPrice"),
                  propulsion: t("vessels.filters.propulsion"),
                  propulsionPlaceholder: t(
                    "vessels.filters.propulsionPlaceholder"
                  ),
                  fuelType: t("vessels.filters.fuelType"),
                  fuelPlaceholder: t("vessels.filters.fuelPlaceholder"),
                  vesselType: t("vessels.filters.vesselType"),
                  vesselTypeAll: t("vessels.filters.vesselTypeAll"),
                  bargeType: t("vessels.filters.bargeType"),
                  bargeTypePlaceholder: t(
                    "vessels.filters.bargeTypePlaceholder"
                  ),
                  rangeUnavailable: t("vessels.filters.rangeUnavailable"),
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

            {paginatedVessels.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {paginatedVessels.map((vessel) => (
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
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href={createPaginationUrl(currentPage - 1)}
                        />
                      </PaginationItem>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((pageNum) => {
                        return (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          Math.abs(pageNum - currentPage) <= 1
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
                                isActive={pageNum === currentPage}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          </div>
                        );
                      })}

                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext
                          href={createPaginationUrl(currentPage + 1)}
                        />
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
