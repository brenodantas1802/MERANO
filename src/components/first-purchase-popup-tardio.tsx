"use client";

import dynamic from "next/dynamic";

// The first-purchase coupon only shows a couple of seconds after the page opens, so its code (and its animation library
// part) loads after the page is ready, not in the first wave that makes phones stutter.
export const FirstPurchasePopupTardio = dynamic(() => import("./first-purchase-popup").then((modulo) => modulo.FirstPurchasePopup), { ssr: false });
