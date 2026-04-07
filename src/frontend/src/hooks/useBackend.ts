import { useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

/**
 * Thin wrapper that binds the project's createActor factory to useActor.
 * Use this everywhere instead of calling useActor() directly.
 */
export function useBackendActor() {
  return useActor(createActor);
}
