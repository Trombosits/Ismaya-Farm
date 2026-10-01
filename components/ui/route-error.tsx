"use client";

import { ErrorState } from "./error-state";

export function RouteError({ reset }: { reset: () => void }) {
  return <ErrorState onRetry={reset} />;
}
