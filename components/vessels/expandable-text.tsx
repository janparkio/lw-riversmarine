"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExpandableTextProps = {
  text: string;
  collapsedHeight?: number;
  moreLabel: string;
  lessLabel: string;
  className?: string;
};

export function ExpandableText({
  text,
  collapsedHeight = 96,
  moreLabel,
  lessLabel,
  className,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (!text) {
    return null;
  }

  const shouldCollapse = text.length > 220;

  return (
    <div className={cn("space-y-2", className)}>
      <p
        className={cn(
          "text-sm text-foreground/90 whitespace-pre-line transition-all",
          shouldCollapse && !expanded && "overflow-hidden"
        )}
        style={
          shouldCollapse && !expanded
            ? {
                maxHeight: collapsedHeight,
                WebkitMaskImage:
                  "linear-gradient(180deg, rgba(0,0,0,1) 60%, rgba(0,0,0,0))",
                maskImage:
                  "linear-gradient(180deg, rgba(0,0,0,1) 60%, rgba(0,0,0,0))",
              }
            : undefined
        }
      >
        {text}
      </p>
      {shouldCollapse && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-2 py-0 h-7 text-xs font-medium self-start"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? lessLabel : moreLabel}
        </Button>
      )}
    </div>
  );
}
