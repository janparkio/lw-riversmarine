"use client";

import React from "react";
import { cn } from "@/lib/utils";

type RevealOwnProps<T extends React.ElementType> = {
    as?: T;
    children?: React.ReactNode;
    className?: string;
    delay?: number;
    stagger?: number;
    once?: boolean;
    threshold?: number;
    rootMargin?: string;
    preserveStack?: boolean;
};

type RevealProps<T extends React.ElementType> = RevealOwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof RevealOwnProps<T>>;

export function Reveal<T extends React.ElementType = "div">(
    props: RevealProps<T>
) {
    const {
        as: Component = "div",
        children,
        className,
        delay,
        stagger = 80,
        once = true,
        threshold = 0.1,
        rootMargin = "0px",
        preserveStack = false,
        ...rest
    } = props;

    const ref = React.useRef<HTMLElement | null>(null);

    React.useEffect(() => {
        const node = ref.current;
        if (!node) return;

        // Find all animation-on-scroll children
        const animatedChildren = node.querySelectorAll('.animation-on-scroll');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // If this element itself has the animation class
                        if (entry.target === node) {
                            setTimeout(() => {
                                entry.target.classList.add('visible');
                            }, delay || 0);
                        } else {
                            // Handle child elements with stagger
                            const children = Array.from(animatedChildren);
                            const index = children.indexOf(entry.target);
                            setTimeout(() => {
                                entry.target.classList.add('visible');
                            }, (delay || 0) + (index >= 0 ? index * stagger : 0));
                        }

                        if (once) observer.unobserve(entry.target);
                    } else if (!once) {
                        entry.target.classList.remove('visible');
                    }
                });
            },
            { threshold, rootMargin }
        );

        // Observe the main element
        observer.observe(node);

        // Observe all children with animation-on-scroll class
        animatedChildren.forEach(child => observer.observe(child));

        return () => observer.disconnect();
    }, [delay, stagger, once, threshold, rootMargin]);

    return (
        <Component
            ref={ref as any}
            className={cn(
                "animation-on-scroll",
                preserveStack && "animation-preserve-stack",
                className
            )}
            {...rest}
        >
            {children}
        </Component>
    );
}


