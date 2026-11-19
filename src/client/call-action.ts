import { createCallAction } from "@sharkord/plugin-sdk/client";
import type { TPlugin } from "../types";

const callAction = createCallAction<TPlugin>();

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export { callAction, errorText };
