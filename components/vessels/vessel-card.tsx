import Image from "next/image";
import Link from "next/link";

import { Vessel, VesselType } from "@/lib/wordpress.d";
import { cn } from "@/lib/utils";
import { Locale, withLocalePath } from "@/i18n/config";
import { formatCurrency, formatNumber } from "@/lib/format";
import { getTranslator } from "@/lib/i18n";
import { vesselTypeLabels, getSelectLabel } from "@/lib/vessel";

import { getFeaturedMediaById, getCategoryById } from "@/lib/wordpress";

export async function VesselCard({
  vessel,
  locale,
}: {
  vessel: Vessel;
  locale: Locale;
}) {
  const t = await getTranslator(locale);
  const specs = vessel.acf?.specs ?? {};
  const coreSpecs = specs.core_specs ?? {};
  const propulsionSpecs = specs.propulsion_power_specs ?? {};
  const dimensions = coreSpecs.dimensions ?? {};
  const lengthUnit = coreSpecs.length_unit ?? "ft";
  const vesselTypeKey = (vessel.acf?.vessel_type ?? "towboat") as VesselType;
  const vesselType = vesselTypeLabels[vesselTypeKey] ?? null;
  const bargeTypeLabel = getSelectLabel(vessel.acf?.barge_type);
  const propulsionLabel = getSelectLabel(propulsionSpecs.propulsion);
  const media = vessel.featured_media
    ? await getFeaturedMediaById(vessel.featured_media, locale)
    : null;
  const category = vessel.categories?.[0]
    ? await getCategoryById(vessel.categories[0], locale)
    : null;

  const formattedLength = dimensions.length
    ? `${dimensions.length} ${lengthUnit}`
    : null;
  const formattedBeam = dimensions.beam
    ? `${dimensions.beam} ${lengthUnit}`
    : null;
  const dimensionsText = formattedLength
    ? formattedBeam
      ? `${formattedLength} × ${formattedBeam}`
      : formattedLength
    : formattedBeam || "—";
  const yearBuilt = coreSpecs.year_built ?? "—";
  const totalHorsePower = propulsionSpecs.total_horse_power;

  return (
    <Link
      href={withLocalePath(locale, `/vessel/${vessel.slug}`)}
      className={cn(
        "border p-4 bg-accent/30 rounded-lg group flex justify-between flex-col not-prose gap-6",
        "hover:bg-accent/75 transition-all"
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="h-48 w-full overflow-hidden relative rounded-md border flex items-center justify-center bg-muted">
          {media?.source_url ? (
            <Image
              className="h-full w-full object-cover"
              src={media.source_url}
              alt={vessel.title?.rendered || "Vessel thumbnail"}
              width={400}
              height={200}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              No image available
            </div>
          )}
        </div>

        <div
          dangerouslySetInnerHTML={{
            __html: vessel.title?.rendered || "Untitled Vessel",
          }}
          className="text-xl text-primary font-medium group-hover:underline decoration-muted-foreground underline-offset-4 decoration-dotted transition-all"
        ></div>

        {(vesselType || bargeTypeLabel) && (
          <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
            {vesselType && <span>{vesselType}</span>}
            {bargeTypeLabel && <span>• {bargeTypeLabel}</span>}
          </div>
        )}

        {/* Vessel specs in structured format */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">
                {t("vessels.card.yearBuilt")}
              </span>
              <span className="font-medium">
                {yearBuilt || "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">
                {t("vessels.card.totalHp")}
              </span>
              <span className="font-medium">
                {totalHorsePower
                  ? `${formatNumber(totalHorsePower, locale)} HP`
                  : "—"}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              {t("vessels.card.dimensions")}
            </span>
            <span className="font-medium">{dimensionsText}</span>
          </div>

          {propulsionLabel && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">
                {t("vessels.card.propulsion")}
              </span>
              <span className="font-medium">{propulsionLabel}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <hr />
        <div className="flex justify-between items-center text-xs">
          <p>{category?.name || "Vessel"}</p>
          {vessel.acf.has_asking_price && vessel.acf.asking_price > 0 && (
            <p className="text-primary font-semibold text-sm">
              {formatCurrency(
                vessel.acf.asking_price,
                vessel.acf.currency || "usd",
                locale
              )}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
