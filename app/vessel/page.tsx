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

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vessel Listings",
  description: "Browse all our vessel listings",
};

export const dynamic = "auto";
export const revalidate = 600;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    page?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const { category, page: pageParam, search } = params;

  // Handle pagination
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const vesselsPerPage = 9;

  // Fetch data based on search parameters using efficient pagination
  const [vesselsResponse, categories] = await Promise.all([
    getVesselsPaginated(page, vesselsPerPage, { category, search }),
    search ? searchCategories(search) : getAllCategories(),
  ]);

  const { data: vessels, headers } = vesselsResponse;
  const { total, totalPages } = headers;

  // Create pagination URL helper
  const createPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", newPage.toString());
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    return `/vessel${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <section className="pt-0">
      <Container>
        <div className="space-y-8">
          <Prose>
            <h2>Vessel Listings</h2>
            <p className="text-muted-foreground">
              {total} {total === 1 ? "vessel" : "vessels"} found
              {search && " matching your search"}
            </p>
          </Prose>

          <div className="space-y-4">
            <SearchInput defaultValue={search} />

            <FilterVessels
              categories={categories}
              selectedCategory={category}
            />
          </div>

          {vessels.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {vessels.map((vessel) => (
                <VesselCard key={vessel.id} vessel={vessel} />
              ))}
            </div>
          ) : (
            <div className="h-24 w-full border rounded-lg bg-accent/25 flex items-center justify-center">
              <p>No vessels found</p>
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
  );
}
