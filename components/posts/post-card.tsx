import Image from "next/image";
import Link from "next/link";

import { Post } from "@/lib/wordpress.d";
import { cn } from "@/lib/utils";
import { Locale, withLocalePath } from "@/i18n/config";
import { formatDate } from "@/lib/format";
import { getTranslator } from "@/lib/i18n";

import {
  getFeaturedMediaById,
  getAuthorById,
  getCategoryById,
} from "@/lib/wordpress";

export async function PostCard({
  post,
  locale,
}: {
  post: Post;
  locale: Locale;
}) {
  const t = await getTranslator(locale);
  const media = post.featured_media
    ? await getFeaturedMediaById(post.featured_media, locale)
    : null;
  const author = post.author ? await getAuthorById(post.author, locale) : null;
  const date = formatDate(post.date, locale);
  const category = post.categories?.[0]
    ? await getCategoryById(post.categories[0], locale)
    : null;

  return (
    <Link
      href={withLocalePath(locale, `/posts/${post.slug}`)}
      className={cn(
        "border p-4 bg-accent/30 rounded-lg group flex justify-between flex-col not-prose gap-8",
        "hover:bg-accent/75 transition-all"
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="h-48 w-full overflow-hidden relative rounded-md border flex items-center justify-center bg-muted">
          {media?.source_url ? (
            <Image
              className="h-full w-full object-cover"
              src={media.source_url}
              alt={post.title?.rendered || "Post thumbnail"}
              width={400}
              height={200}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              {t("posts.card.noImage")}
            </div>
          )}
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: post.title?.rendered || "Untitled Post",
          }}
          className="text-xl text-primary font-medium group-hover:underline decoration-muted-foreground underline-offset-4 decoration-dotted transition-all"
        ></div>
        <div
          className="text-sm"
          dangerouslySetInnerHTML={{
            __html: post.excerpt?.rendered
              ? post.excerpt.rendered.split(" ").slice(0, 12).join(" ").trim() +
                "..."
              : t("posts.card.noExcerpt"),
          }}
        ></div>
      </div>

      <div className="flex flex-col gap-4">
        <hr />
        <div className="flex justify-between items-center text-xs">
          <p>{category?.name || t("posts.card.uncategorized")}</p>
          <p>{date}</p>
        </div>
      </div>
    </Link>
  );
}
