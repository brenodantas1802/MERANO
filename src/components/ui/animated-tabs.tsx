"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

export function TabsList({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  const layoutId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [activeRect, setActiveRect] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;

    function measure() {
      const active = node!.querySelector('[data-state="active"]') as HTMLElement | null;
      if (active) setActiveRect({ left: active.offsetLeft, width: active.offsetWidth });
    }

    measure();
    const observer = new MutationObserver(measure);
    observer.observe(node, { attributes: true, attributeFilter: ["data-state"], subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <TabsPrimitive.List ref={listRef} className={cn("relative flex gap-1 border-b border-[var(--line)]", className)} {...props}>
      {children}
      {activeRect && (
        <motion.div
          layoutId={`tab-indicator-${layoutId}`}
          className="pointer-events-none absolute bottom-0 h-[2px] bg-[var(--ink)]"
          animate={{ left: activeRect.left, width: activeRect.width }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "sans relative px-4 py-3 text-[11px] uppercase tracking-[.14em] text-[var(--muted)] transition-colors data-[state=active]:text-[var(--ink)]",
        className,
      )}
      {...props}
    />
  );
}
