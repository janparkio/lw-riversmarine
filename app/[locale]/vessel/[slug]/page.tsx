import {
  getVesselBySlug,
  getVesselById,
  getFeaturedMediaById,
  getCategoryById,
  getAllVesselSlugs,
} from "@/lib/wordpress";

import { Section, Container, Article, Prose } from "@/components/craft";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/site.config";
import { formatCurrency, formatNumber } from "@/lib/format";
import { getTranslator } from "@/lib/i18n";

import { locales, Locale, withLocalePath } from "@/i18n/config";
import { VesselGallery } from "@/components/vessels/vessel-gallery";
import { ContactForm } from "@/components/vessels/contact-form";
import {
  UnitProvider,
  UnitToggle,
  DimensionValue,
} from "@/components/vessels/unit-toggle";
import { ExpandableText } from "@/components/vessels/expandable-text";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Balancer from "react-wrap-balancer";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { VesselType } from "@/lib/wordpress.d";
import { LanguageAlternatesScript } from "@/components/language/language-alternates-script";
import { TranslationFallback } from "@/components/language/translation-fallback";
import { resolvePolylangResource } from "@/lib/polylang";
import {
  cargoTankMaterialLabels,
  classificationSocietyLabels,
  getSelectLabel,
  heatingLabels,
  propulsionLabels,
  pumpLabels,
  vaporRecoveryLabels,
  vesselTypeLabels,
} from "@/lib/vessel";

export async function generateStaticParams() {
  const params = await Promise.all(
    locales.map(async (locale) => {
      const slugs = await getAllVesselSlugs(locale);
      return slugs.map(({ slug }) => ({
        locale,
        slug,
      }));
    })
  );

  return params.flat();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolution = await resolvePolylangResource({
    slug,
    locale,
    fetchBySlug: getVesselBySlug,
    fetchById: getVesselById,
    buildPath: (resolvedSlug) => `/vessel/${resolvedSlug}`,
  });

  if (!resolution) {
    return {};
  }

  const vessel = resolution.resource;

  const ogUrl = new URL(`${siteConfig.site_domain}/api/og`);
  ogUrl.searchParams.append("title", vessel.title.rendered);
  const description =
    vessel.acf.meta_description || "View vessel specifications and details";
  ogUrl.searchParams.append("description", description);

  const localePath = withLocalePath(locale, `/vessel/${vessel.slug}`);
  const absoluteUrl = `${siteConfig.site_domain}${localePath}`;
  const languageAlternates = Object.fromEntries(
    Object.entries(resolution.alternates).filter(
      ([, value]) => Boolean(value)
    )
  ) as Record<string, string>;

  return {
    title: vessel.title.rendered,
    description: description,
    alternates: {
      canonical: absoluteUrl,
      languages: languageAlternates,
    },
    openGraph: {
      title: vessel.title.rendered,
      description: description,
      type: "article",
      url: absoluteUrl,
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
      site: siteConfig.site_domain,
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
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslator(locale);
  const resolution = await resolvePolylangResource({
    slug,
    locale,
    fetchBySlug: getVesselBySlug,
    fetchById: getVesselById,
    buildPath: (resolvedSlug) => `/vessel/${resolvedSlug}`,
  });

  if (!resolution) {
    notFound();
  }

  if (resolution.redirectPath) {
    redirect(resolution.redirectPath);
  }

  const { resource: vessel, alternates, translationMissing, contentLocale } =
    resolution;
  const sourceLocale = contentLocale ?? locale;
  const fallbackDescription = t("languageSwitcher.fallback.description", {
    sourceLocale: t(`languageSwitcher.locale.${sourceLocale}`),
    targetLocale: t(`languageSwitcher.locale.${locale}`),
  });
  const yesLabel = t("common.yes");
  const noLabel = t("common.no");
  const showMoreLabel = t("common.showMore");
  const showLessLabel = t("common.showLess");

  // Fetch gallery images
  const galleryImages = vessel.acf.gallery
    ? await Promise.all(
      vessel.acf.gallery.map((id) => getFeaturedMediaById(id, locale))
    )
    : [];

  // Add featured media to gallery if it exists
  const featuredMedia = vessel.featured_media
    ? await getFeaturedMediaById(vessel.featured_media, locale)
    : null;

  // Combine featured and gallery images
  const allImages = featuredMedia
    ? [featuredMedia, ...galleryImages]
    : galleryImages;

  const category = vessel.categories?.[0]
    ? await getCategoryById(vessel.categories[0], locale)
    : null;

  const specs = vessel.acf.specs ?? {};
  const coreSpecs = specs.core_specs ?? {};
  const propulsionSpecs = specs.propulsion_power_specs ?? {};
  const bargeTankFields = specs.barge_specs?.tank_fields;
  const fuel = specs.fuel ?? {};
  const dimensions = coreSpecs.dimensions ?? {};
  const lengthUnit = coreSpecs.length_unit || "ft";
  const vesselTypeKey = (vessel.acf.vessel_type ?? "towboat") as VesselType;
  const vesselTypeLabel = vesselTypeLabels[vesselTypeKey];
  const bargeTypeLabel = getSelectLabel(vessel.acf.barge_type);
  const conditionLabel = getSelectLabel(vessel.acf.condition);
  const propulsionLabel = getSelectLabel(
    propulsionSpecs.propulsion,
    propulsionLabels
  );
  const classificationLabel = coreSpecs.classification_society
    ? classificationSocietyLabels[coreSpecs.classification_society] ??
    coreSpecs.classification_society
    : "";
  const fuelTypeLabel = fuel.type
    ? fuelTypeLabels[fuel.type] ?? fuel.type
    : "";
  const cargoCapacity = bargeTankFields?.cargo_capacity;
  const vaporRecoveryLabel = getSelectLabel(
    bargeTankFields?.vapor_recovery,
    vaporRecoveryLabels
  );
  const heatedLabel = getSelectLabel(
    bargeTankFields?.heated,
    heatingLabels
  );
  const cargoTankMaterialLabel = getSelectLabel(
    bargeTankFields?.cargo_tank_material,
    cargoTankMaterialLabels
  );
  const pumpsLabel = bargeTankFields?.pumps
    ? pumpLabels[bargeTankFields.pumps] ?? bargeTankFields.pumps
    : "";
  const isBarge = vessel.acf.vessel_type === "barge";
  const totalHorsePower = propulsionSpecs.total_horse_power;

  type SpecRow = {
    label: string;
    value: ReactNode;
    fullWidth?: boolean;
    variant?: "card" | "table";
  };
  const specRows: SpecRow[] = [];
  const bargeRows: SpecRow[] = [];

  const pushRow = (
    label: string,
    value: ReactNode | null | undefined,
    options?: { fullWidth?: boolean; variant?: "card" | "table" }
  ) => {
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")
    ) {
      return;
    }
    specRows.push({
      label,
      value,
      fullWidth: options?.fullWidth,
      variant: options?.variant,
    });
  };

  const pushBargeRow = (
    label: string,
    value: ReactNode | null | undefined
  ) => {
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")
    ) {
      return;
    }
    bargeRows.push({ label, value });
  };

  if (vesselTypeLabel) {
    pushRow(t("vessels.detail.table.vesselType"), vesselTypeLabel, {
      variant: "card",
    });
  }
  if (isBarge && bargeTypeLabel) {
    pushRow(t("vessels.detail.table.bargeType"), bargeTypeLabel);
  }
  pushRow(t("vessels.detail.table.yearBuilt"), coreSpecs.year_built, {
    variant: "card",
  });
  if (coreSpecs.deadweight_tons) {
    pushRow(
      t("vessels.detail.table.deadweightTons"),
      `${formatNumber(coreSpecs.deadweight_tons, locale)}`
    );
  }
  if (
    coreSpecs.classification_society &&
    coreSpecs.classification_society !== "none"
  ) {
    pushRow(
      t("vessels.detail.table.classificationSociety"),
      classificationLabel
    );
  }
  pushRow(
    t("vessels.detail.table.mainEngines"),
    propulsionSpecs.main_engines
  );
  pushRow(
    t("vessels.detail.table.reductionGears"),
    propulsionSpecs.reduction_gears
  );
  if (propulsionSpecs.horse_power) {
    pushRow(
      t("vessels.detail.table.horsePower"),
      `${formatNumber(propulsionSpecs.horse_power, locale)} HP`
    );
  }
  if (totalHorsePower) {
    pushRow(
      t("vessels.detail.table.totalHorsePower"),
      `${formatNumber(totalHorsePower, locale)} HP`
    );
  }
  if (dimensions.length) {
    pushRow(
      t("vessels.detail.table.length"),
      <DimensionValue value={dimensions.length} originalUnit={lengthUnit} />
    );
  }
  if (dimensions.beam) {
    pushRow(
      t("vessels.detail.table.beam"),
      <DimensionValue value={dimensions.beam} originalUnit={lengthUnit} />
    );
  }
  if (dimensions.depth) {
    pushRow(
      t("vessels.detail.table.hullDepth"),
      <DimensionValue value={dimensions.depth} originalUnit={lengthUnit} />
    );
  }
  if (dimensions.draft) {
    pushRow(
      t("vessels.detail.table.draft"),
      <DimensionValue value={dimensions.draft} originalUnit={lengthUnit} />
    );
  }
  if (dimensions.air_draft) {
    pushRow(
      t("vessels.detail.table.airDraft"),
      <DimensionValue value={dimensions.air_draft} originalUnit={lengthUnit} />
    );
  }
  pushRow(t("vessels.detail.table.propulsion"), propulsionLabel);
  pushRow(t("vessels.detail.table.location"), vessel.acf.location);
  pushRow(t("vessels.detail.table.condition"), conditionLabel);
  pushRow(t("vessels.detail.table.fuelType"), fuelTypeLabel);
  if (fuel.notes) {
    pushRow(
      t("vessels.detail.table.fuelNotes"),
      <ExpandableText
        text={fuel.notes}
        moreLabel={showMoreLabel}
        lessLabel={showLessLabel}
      />,
      { fullWidth: true, variant: "card" }
    );
  }
  pushRow(t("vessels.detail.table.bunkering"), fuel.bunkering);

  if (bargeTankFields?.regulated_us !== undefined) {
    pushBargeRow(
      t("vessels.detail.table.regulatedUs"),
      bargeTankFields.regulated_us ? yesLabel : noLabel
    );
  }

  const cargoParts: string[] = [];
  if (cargoCapacity?.barrels) {
    cargoParts.push(`${formatNumber(cargoCapacity.barrels, locale)} bbl`);
  }
  if (cargoCapacity?.m3_metric_tons) {
    cargoParts.push(cargoCapacity.m3_metric_tons);
  }
  if (cargoParts.length > 0) {
    pushBargeRow(
      t("vessels.detail.table.cargoCapacity"),
      cargoParts.join(" • ")
    );
  }

  pushBargeRow(t("vessels.detail.table.pumps"), pumpsLabel);
  pushBargeRow(
    t("vessels.detail.table.cargoTankMaterial"),
    cargoTankMaterialLabel
  );
  pushBargeRow(t("vessels.detail.table.vaporRecovery"), vaporRecoveryLabel);
  pushBargeRow(t("vessels.detail.table.heated"), heatedLabel);

  const cardRows = specRows.filter((row) => row.variant === "card");
  const tableRows = specRows.filter(
    (row) => !row.variant || row.variant === "table"
  );

  return (
    <>
      <LanguageAlternatesScript alternates={alternates} activeLocale={locale} />
      <UnitProvider defaultUnit={lengthUnit}>
        <Container>
          {translationMissing && (
            <TranslationFallback
              title={t("languageSwitcher.fallback.title")}
              description={fallbackDescription}
              className="mb-6"
            />
          )}
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
                {coreSpecs.year_built && (
                  <span className="text-muted-foreground">
                    {coreSpecs.year_built}
                  </span>
                )}
                {coreSpecs.year_built && totalHorsePower && (
                  <span className="text-muted-foreground">|</span>
                )}
                {totalHorsePower && (
                  <span className="text-muted-foreground">
                    {t("vessels.detail.meta.hp", {
                      hp: formatNumber(totalHorsePower, locale),
                    })}
                  </span>
                )}
                {(coreSpecs.year_built || totalHorsePower) &&
                  dimensions.length && <span className="text-muted-foreground">|</span>}
                {dimensions.length && (
                  <span className="text-muted-foreground">
                    {t("vessels.detail.meta.length", {
                      length: dimensions.length,
                      beam: dimensions.beam ?? "—",
                      unit: lengthUnit,
                    })}
                  </span>
                )}
              </div>

              {category && (
                <Link
                  href={withLocalePath(locale, `/vessel/?category=${category.id}`)}
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
                    {t("vessels.detail.askingPrice")}
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(
                      vessel.acf.asking_price,
                      vessel.acf.currency || "usd",
                      locale
                    )}
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

          <div className="space-y-6">
            {/* Vessel Specs Table */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                {t("vessels.detail.specs.heading")}
              </h2>
              <UnitToggle />
            </div>

            {/* Vessel Specs Cards */}
            {(cardRows.length > 0 || tableRows.length > 0) && (
              <div className="space-y-6">
                {cardRows.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {cardRows.map((row) => (
                      <div
                        key={row.label}
                        className={cn(
                          "rounded-lg border bg-card/40 p-4 shadow-sm h-full",
                          row.fullWidth && "md:col-span-2 xl:col-span-3"
                        )}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {row.label}
                        </p>
                        <div className="mt-2 text-base leading-relaxed">
                          {row.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Vessel Specs Table */}
                {tableRows.length > 0 && (
                  <div className="overflow-hidden rounded-lg border shadow-sm">
                    <table className="w-full m-0">
                      <tbody>
                        {tableRows.map((row) => (
                          <tr
                            key={row.label}
                            className="border-b last:border-b-0"
                          >
                            <th
                              scope="row"
                              className="bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground align-top md:w-1/3"
                            >
                              {row.label}
                            </th>
                            <td className="px-4 py-3 text-base leading-relaxed">
                              {row.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Barge Specs Table */}
            {isBarge && bargeRows.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold">
                  {t("vessels.detail.specs.bargeHeading")}
                </h3>
                <div className="overflow-hidden rounded-lg border shadow-sm">
                  <table className="w-full m-0">
                    <tbody>
                      {bargeRows.map((row) => (
                        <tr
                          key={row.label}
                          className="border-b last:border-b-0"
                        >
                          <th
                            scope="row"
                            className="bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground align-top md:w-1/3"
                          >
                            {row.label}
                          </th>
                          <td className="px-4 py-3 text-base leading-relaxed">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Additional Content */}
          {vessel.content.rendered && (
            <Article dangerouslySetInnerHTML={{ __html: vessel.content.rendered }} />
          )}

          {/* Contact Section */}
          <div className="grid md:grid-cols-2 gap-8 my-12">
            {/* Call Button */}
            <div className="border rounded-lg p-6 bg-accent/20 flex flex-col justify-center items-center space-y-4">
              <h3 className="text-2xl font-semibold">
                {t("vessels.detail.contact.interested")}
              </h3>
              <p className="text-muted-foreground text-center">
                {t("vessels.detail.contact.description")}
              </p>
              <div className="flex gap-4">
                <Button size="lg" variant="default" asChild>
                  <a href="tel:+1234567890">{t("vessels.detail.contact.callUs")}</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href={withLocalePath(locale, "/contact")}>
                    {t("vessels.detail.contact.contactPage")}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="border rounded-lg p-6 bg-card">
              <h3 className="text-2xl font-semibold mb-4">
                {t("vessels.detail.form.title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t("vessels.detail.form.description")}
              </p>
              <ContactForm
                vesselTitle={vessel.title.rendered}
                messages={{
                  success: t("vessels.detail.form.success"),
                  submit: t("vessels.detail.form.submit"),
                }}
              />
            </div>
          </div>
        </Container>
      </UnitProvider>
    </>
  );
}
