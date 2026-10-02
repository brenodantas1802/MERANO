"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

// Eased wheel scrolling across the site. Touch keeps the phone's native scroll; reduced-motion users get plain scrolling.
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -72 }, lerp: 0.09 });
    return () => lenis.destroy();
  }, []);
  return null;
}
