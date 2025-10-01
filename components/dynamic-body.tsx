"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function DynamicBody() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    useEffect(() => {
        // Remove both classes first
        document.body.classList.remove("bg-homepage", "bg-site");

        // Add the appropriate class based on the current route
        if (isHomePage) {
            document.body.classList.add("bg-homepage");
        } else {
            document.body.classList.add("bg-site");
        }
    }, [isHomePage]);

    return null;
}

