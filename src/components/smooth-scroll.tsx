"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Eased wheel scrolling across the site. Touch keeps the phone's native scroll; reduced-motion users get plain scrolling.
export function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const firstPath = useRef(true);
  const cameBack = useRef(false);

  useEffect(() => {
    const onPopState = () => { cameBack.current = true; };
    window.addEventListener("popstate", onPopState);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) lenis.current = new Lenis({ autoRaf: true, anchors: { offset: -72 }, lerp: 0.09 });
    return () => { window.removeEventListener("popstate", onPopState); lenis.current?.destroy(); lenis.current = null; };
  }, []);

  // A glide still in flight would carry the next page down with it: start every new page at the top.
  // Back/forward keeps the position the browser restores, and links to an anchor keep their target.
  useEffect(() => {
    if (firstPath.current) { firstPath.current = false; return; }
    if (cameBack.current) { cameBack.current = false; lenis.current?.resize(); return; }
    if (window.location.hash) return;
    lenis.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
