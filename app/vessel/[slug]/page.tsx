import {
  getVesselBySlug,
  getFeaturedMediaById,
  getCategoryById,
  getAllVesselSlugs,
} from "@/lib/wordpress";

import { Section, Container, Article, Prose } from "@/components/craft";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/site.config";
import { VesselGallery } from "@/components/vessels/vessel-gallery";
import { ContactForm } from "@/components/vessels/contact-form";
import {
  UnitProvider,
  UnitToggle,
  DimensionValue,
} from "@/components/vessels/unit-toggle";

import Link from "next/link";
import Balancer from "react-wrap-balancer";

import type { Metadata } from "next";

export async function generateStaticParams() {
  return await getAllVesselSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vessel = await getVesselBySlug(slug);

  if (!vessel) {
    return {};
  }

  const ogUrl = new URL(`${siteConfig.site_domain}/api/og`);
  ogUrl.searchParams.append("title", vessel.title.rendered);
  const description =
    vessel.acf.meta_description || "View vessel specifications and details";
  ogUrl.searchParams.append("description", description);

  return {
    title: vessel.title.rendered,
    description: description,
    openGraph: {
      title: vessel.title.rendered,
      description: description,
      type: "article",
      url: `${siteConfig.site_domain}/vessel/${vessel.slug}`,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: vessel.title.rendered,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: vessel.title.rendered,
      description: description,
      images: [ogUrl.toString()],
    },
  };
}

// Fuel type labels mapping
const fuelTypeLabels: Record<string, string> = {
  diesel_mgo: "Diesel (MGO)",
  diesel_mdo: "Diesel (MDO)",
  diesel_ulsfo: "Diesel (ULSFO/VLSFO)",
  biodiesel_blend: "Biodiesel blend",
  hvo_renewable_diesel: "HVO/Renewable Diesel",
  lng_dual_fuel: "LNG (dual-fuel)",
  methanol_dual_fuel: "Methanol (dual-fuel)",
  lpg_dual_fuel: "LPG (dual-fuel)",
  hydrogen_fuel_cell: "Hydrogen (fuel-cell)",
  hybrid_diesel_electric: "Hybrid Diesel–Electric",
  battery_electric: "Battery-Electric",
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vessel = await getVesselBySlug(slug);

  // Fetch gallery images
  const galleryImages = vessel.acf.gallery
    ? await Promise.all(
      vessel.acf.gallery.map((id) => getFeaturedMediaById(id))
    )
    : [];

  // Add featured media to gallery if it exists
  const featuredMedia = vessel.featured_media
    ? await getFeaturedMediaById(vessel.featured_media)
    : null;

  // Combine featured and gallery images
  const allImages = featuredMedia
    ? [featuredMedia, ...galleryImages]
    : galleryImages;

  const category = vessel.categories?.[0]
    ? await getCategoryById(vessel.categories[0])
    : null;

  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  const specs = vessel.acf.specs;
  const dimensions = specs.dimensions;
  const lengthUnit = specs.length_unit || "ft";

  return (
    <UnitProvider defaultUnit={lengthUnit}>
      <Container>
        <Prose>
          <h1>
            <Balancer>
              <span
                className="text-3xl md:text-5xl"
                dangerouslySetInnerHTML={{ __html: vessel.title.rendered }}
              ></span>
            </Balancer>
          </h1>

          {/* Meta information */}
          <div className="flex justify-between items-center gap-4 text-base md:text-lg">
            <div className="flex gap-2 items-center">
              {specs.year_built && (
                <span className="text-muted-foreground">
                  {specs.year_built}
                </span>
              )}
              {specs.year_built && specs.total_horse_power && (
                <span className="text-muted-foreground">|</span>
              )}
              {specs.total_horse_power && (
                <span className="text-muted-foreground">
                  {specs.total_horse_power.toLocaleString()} HP
                </span>
              )}
              {(specs.year_built || specs.total_horse_power) &&
                dimensions.length && <span className="text-muted-foreground">|</span>}
              {dimensions.length && (
                <span className="text-muted-foreground">
                  {dimensions.length} {lengthUnit} × {dimensions.beam}{" "}
                  {lengthUnit}
                </span>
              )}
            </div>

            {category && (
              <Link
                href={`/vessel/?category=${category.id}`}
                className={cn(
                  badgeVariants({ variant: "outline" }),
                  "!no-underline"
                )}
              >
                {category.name}
              </Link>
            )}
          </div>

          {/* Asking Price */}
          {vessel.acf.has_asking_price && vessel.acf.asking_price > 0 && (
            <div className="my-6 p-4 border rounded-lg bg-accent/20">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Asking price
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(vessel.acf.asking_price, vessel.acf.currency)}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          {vessel.acf.meta_description && (
            <div className="my-6">
              <p className="text-lg">{vessel.acf.meta_description}</p>
            </div>
          )}
        </Prose>

        {/* Gallery */}
        {allImages.length > 0 && (
          <div className="mb-12">
            <VesselGallery images={allImages} />
          </div>
        )}

        <Prose>

          {/* Vessel Specs Table */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="!mb-0">Vessel Specifications</h2>
            <div className="not-prose">
              <UnitToggle />
            </div>
          </div>

          <div className="not-prose my-6">
            <table className="w-full border-collapse">
              <tbody>
                {/* Main Engines */}
                {specs.main_engines && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Main Engines
                    </td>
                    <td className="py-3 px-4">{specs.main_engines}</td>
                  </tr>
                )}

                {/* Reduction Gears */}
                {specs.reduction_gears && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Reduction Gears
                    </td>
                    <td className="py-3 px-4">{specs.reduction_gears}</td>
                  </tr>
                )}

                {/* Year Built */}
                {specs.year_built && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Year Built
                    </td>
                    <td className="py-3 px-4">{specs.year_built}</td>
                  </tr>
                )}

                {/* Horsepower */}
                {specs.horse_power && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Horsepower (per engine)
                    </td>
                    <td className="py-3 px-4">
                      {specs.horse_power.toLocaleString()} HP
                    </td>
                  </tr>
                )}

                {/* Total Horsepower */}
                {specs.total_horse_power && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Total Horsepower
                    </td>
                    <td className="py-3 px-4">
                      {specs.total_horse_power.toLocaleString()} HP
                    </td>
                  </tr>
                )}

                {/* Dimensions - Length */}
                {dimensions.length && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Length
                    </td>
                    <td className="py-3 px-4">
                      <DimensionValue
                        value={dimensions.length}
                        originalUnit={lengthUnit}
                      />
                    </td>
                  </tr>
                )}

                {/* Dimensions - Beam */}
                {dimensions.beam && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Beam
                    </td>
                    <td className="py-3 px-4">
                      <DimensionValue
                        value={dimensions.beam}
                        originalUnit={lengthUnit}
                      />
                    </td>
                  </tr>
                )}

                {/* Dimensions - Depth */}
                {dimensions.depth && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Depth
                    </td>
                    <td className="py-3 px-4">
                      <DimensionValue
                        value={dimensions.depth}
                        originalUnit={lengthUnit}
                      />
                    </td>
                  </tr>
                )}

                {/* Dimensions - Draft */}
                {dimensions.draft && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Draft
                    </td>
                    <td className="py-3 px-4">
                      <DimensionValue
                        value={dimensions.draft}
                        originalUnit={lengthUnit}
                      />
                    </td>
                  </tr>
                )}

                {/* Dimensions - Air Draft */}
                {dimensions.air_draft && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Air Draft
                    </td>
                    <td className="py-3 px-4">
                      <DimensionValue
                        value={dimensions.air_draft}
                        originalUnit={lengthUnit}
                      />
                    </td>
                  </tr>
                )}

                {/* Propulsion */}
                {specs.propulsion && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Propulsion
                    </td>
                    <td className="py-3 px-4">{specs.propulsion}</td>
                  </tr>
                )}

                {/* Location */}
                {specs.location && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Location
                    </td>
                    <td className="py-3 px-4">{specs.location}</td>
                  </tr>
                )}

                {/* Fuel Type */}
                {specs.fuel?.type && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Fuel Type
                    </td>
                    <td className="py-3 px-4">
                      {fuelTypeLabels[specs.fuel.type] || specs.fuel.type}
                    </td>
                  </tr>
                )}

                {/* Fuel Notes */}
                {specs.fuel?.notes && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Fuel Notes
                    </td>
                    <td className="py-3 px-4">{specs.fuel.notes}</td>
                  </tr>
                )}

                {/* Bunkering */}
                {specs.fuel?.bunkering && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Bunkering
                    </td>
                    <td className="py-3 px-4">{specs.fuel.bunkering}</td>
                  </tr>
                )}

                {/* Condition */}
                {specs.condition && (
                  <tr className="border-b">
                    <td className="py-3 px-4 bg-muted/30 font-medium text-sm">
                      Condition
                    </td>
                    <td className="py-3 px-4">{specs.condition}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Prose>

        {/* Additional Content */}
        {vessel.content.rendered && (
          <Article dangerouslySetInnerHTML={{ __html: vessel.content.rendered }} />
        )}

        {/* Contact Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Call Button */}
          <div className="border rounded-lg p-6 bg-accent/20 flex flex-col justify-center items-center space-y-4">
            <h3 className="text-2xl font-semibold">Interested in this vessel?</h3>
            <p className="text-muted-foreground text-center">
              Contact us directly for inquiries or to request more information.
            </p>
            <div className="flex gap-4">
              <Button size="lg" variant="default" asChild>
                <a href="tel:+1234567890">Call Us</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/contact">Contact Page</a>
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-2xl font-semibold mb-4">Request Information</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Fill out the form below and we&apos;ll get back to you shortly.
            </p>
            <ContactForm vesselTitle={vessel.title.rendered} />
          </div>
        </div>
      </Container>
    </UnitProvider>
  );
}
