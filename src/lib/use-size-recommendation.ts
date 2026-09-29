"use client";

import { useBodyProfile } from "./body-profile";
import { getSizeChart, SIZE_CHART, type Product } from "./products";
import { recommendSize } from "./size-recommendation";

// Size suggested for this piece (or the house chart) from the customer's saved body profile.
export function useSizeRecommendation(product?: Product) {
  const { profile, hasAny } = useBodyProfile();
  return { recommendation: recommendSize(profile, product ? getSizeChart(product) : SIZE_CHART), hasProfile: hasAny };
}
