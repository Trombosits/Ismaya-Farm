export type ActionState =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };
