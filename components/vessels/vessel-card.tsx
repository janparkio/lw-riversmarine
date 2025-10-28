import Image from "next/image";
import Link from "next/link";

import { Vessel } from "@/lib/wordpress.d";
import { cn } from "@/lib/utils";

import { getFeaturedMediaById, getCategoryById } from "@/lib/wordpress";

export async function VesselCard({ vessel }: { vessel: Vessel }) {
  const media = vessel.featured_media
    ? await getFeaturedMediaById(vessel.featured_media)
    : null;
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

  // Format dimensions
  const dimensions = vessel.acf.specs.dimensions;
  const lengthUnit = vessel.acf.specs.length_unit;
  const dimensionsText = `${dimensions.length || "—"} ${lengthUnit} × ${
    dimensions.beam || "—"
  } ${lengthUnit}`;

  return (
    <Link
      href={`/vessel/${vessel.slug}`}
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

        {/* Vessel specs in structured format */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Year Built</span>
              <span className="font-medium">
                {vessel.acf.specs.year_built || "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Total HP</span>
              <span className="font-medium">
                {vessel.acf.specs.total_horse_power
                  ? `${vessel.acf.specs.total_horse_power.toLocaleString()} HP`
                  : "—"}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Dimensions</span>
            <span className="font-medium">{dimensionsText}</span>
          </div>

          {vessel.acf.specs.propulsion && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Propulsion</span>
              <span className="font-medium">{vessel.acf.specs.propulsion}</span>
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
              {formatPrice(vessel.acf.asking_price, vessel.acf.currency)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
