"use client";

import { useState } from "react";
import Image from "next/image";
import { FeaturedMedia } from "@/lib/wordpress.d";
import { cn } from "@/lib/utils";

interface VesselGalleryProps {
  images: FeaturedMedia[];
}

export function VesselGallery({ images }: VesselGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative h-[400px] md:h-[600px] overflow-hidden rounded-lg border bg-muted">
        <Image
          src={images[selectedImage].source_url}
          alt={images[selectedImage].alt_text || "Vessel image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "relative h-20 md:h-24 overflow-hidden rounded-md border-2 transition-all",
                selectedImage === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Image
                src={image.source_url}
                alt={image.alt_text || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="150px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
