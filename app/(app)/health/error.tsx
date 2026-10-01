"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function HealthError({ reset }: { reset: () => void }) {
  return <ErrorState onRetry={reset} />;
}
