"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function LivestockDetailError({ reset }: { reset: () => void }) {
  return <ErrorState onRetry={reset} />;
}
