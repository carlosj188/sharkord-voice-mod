import { useStoreSelector } from "@sharkord/plugin-sdk/client";
import { memo, useCallback, useEffect, useState, type CSSProperties } from "react";
import type { TVoiceTarget } from "../types";
import { callAction, errorText } from "./call-action";
import { msg } from "./lang";

const buttonStyle: CSSProperties = {
  background: "transparent",
  border: 0,
  color: "inherit",
  cursor: "pointer",
  fontSize: 16,
  padding: "2px 4px",
};

/**
 * USER_POPOVER: the same actions as icons. They stay inside the popover: a
 * floating menu would count as a click outside and close it.
 */
const PopoverButtons = memo(({ userId }: { userId: number }) => {
  const ownUserId = useStoreSelector((state) => state.ownUserId);
  const [target, setTarget] = useState<TVoiceTarget | null>(null);
  const [busy, setBusy] = useState(false);
  const isSelf = userId === ownUserId;

  const refresh = useCallback(() => {
    callAction("voiceState", { userId }).then(setTarget, () => setTarget(null));
  }, [userId]);

  useEffect(() => {
    if (!isSelf) refresh();
  }, [isSelf, refresh]);

  if (isSelf || !target) return null;

  const run = (action: () => Promise<unknown>) => async () => {
    setBusy(true);
    try {
      await action();
    } catch (e) {
      window.alert(errorText(e));
    }
    setBusy(false);
    refresh();
  };

  return (
    <>
      <button
        type="button"
        title={msg.disconnect}
        disabled={busy}
        style={buttonStyle}
        onClick={run(() => callAction("disconnectUser", { userId }))}
      >
        📵
      </button>
      <button
        type="button"
        title={target.serverMuted ? msg.unmute : msg.mute}
        disabled={busy}
        style={buttonStyle}
        onClick={run(() =>
          callAction("setMute", { userId, muted: !target.serverMuted }),
        )}
      >
        {target.serverMuted ? "🔈" : "🔇"}
      </button>
    </>
  );
});

export { PopoverButtons };
