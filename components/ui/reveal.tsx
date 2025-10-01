"use client";

import React from "react";
import { cn } from "@/lib/utils";

type RevealOwnProps<T extends React.ElementType> = {
  as?: T;
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
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
    delay = 0,
    once = true,
    threshold = 0.15,
    rootMargin = "0px 0px -10% 0px",
    ...rest
  } = props;

  const ref = React.useRef<HTMLElement | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return (
    <Component
      ref={ref as any}
      className={cn(
        "will-change-transform transition-opacity transition-transform duration-700 ease-out",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        "motion-reduce:opacity-100 motion-reduce:translate-y-0",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Component>
  );
}


