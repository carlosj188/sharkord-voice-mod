import { actions } from "@sharkord/plugin-sdk/client";
import type { TPlugin } from "../types";
import { findMutedMicButton } from "./dom";

/**
 * Whoever the server unmutes gets their mic back the way it was before the
 * mute. There is no SDK action for the user's own mic, so wait for serverMuted
 * to clear and press the host's mic button.
 */
const restoreMic = () => {
  const store = window.__SHARKORD_STORE__;
  const started = Date.now();

  // true when there is nothing left to do
  const tryUnmute = () => {
    const { ownVoiceState, currentVoiceChannelId } = store.getState();
    if (!currentVoiceChannelId || !ownVoiceState.micMuted) return true;
    if (ownVoiceState.serverMuted || ownVoiceState.soundMuted) return false;

    const button = findMutedMicButton();
    if (!button) return false;

    button.click();
    return true;
  };

  if (tryUnmute()) return;

  const timer = setInterval(() => {
    if (tryUnmute() || Date.now() - started > 10_000) clearInterval(timer);
  }, 200);
};

/**
 * Listens at module level rather than with `usePush`: the components only
 * render for moderators, and the person being unmuted usually is not one.
 */
const listenForRestoreMic = () => {
  const pluginId = decodeURIComponent(
    import.meta.url.match(/\/plugin-bundle\/([^/?#]+)\//)?.[1] ?? "voice-mod",
  );

  actions.onPush(pluginId, (data) => {
    if ((data as TPlugin["push"] | undefined)?.type === "restore-mic") restoreMic();
  });
};

export { listenForRestoreMic };
