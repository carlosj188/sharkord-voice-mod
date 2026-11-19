import { memo, useEffect, useState, type MouseEvent } from "react";
import type { TVoiceTarget } from "../types";
import { callAction, errorText } from "./call-action";
import { menuItemClass } from "./dom";
import { msg } from "./lang";

type TProps = { userId: number; channelId?: number; onDone: () => void };

/** Mute/Unmute and Disconnect, as menu items under a separator */
const ModerationItems = memo(({ userId, channelId, onDone }: TProps) => {
  // undefined while loading, null when the user is not in a call
  const [target, setTarget] = useState<TVoiceTarget | null>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    callAction("voiceState", { userId, channelId }).then(setTarget, (e) =>
      setError(errorText(e)),
    );
  }, [userId, channelId]);

  if (target === null) return null;

  const run = (action: () => Promise<unknown>) => async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    setError("");
    try {
      await action();
      onDone();
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  const disabled = busy || target === undefined;
  const muted = !!target?.serverMuted;

  return (
    <div onPointerDown={(e) => e.stopPropagation()}>
      <div className="-mx-1 my-1 h-px bg-border" />
      <button
        type="button"
        className={menuItemClass}
        disabled={disabled}
        onClick={run(() => callAction("setMute", { userId, muted: !muted }))}
      >
        {muted ? `🔈 ${msg.unmute}` : `🔇 ${msg.mute}`}
      </button>
      <button
        type="button"
        className={menuItemClass}
        style={{ color: "var(--destructive, #ef4444)" }}
        disabled={disabled}
        onClick={run(() => callAction("disconnectUser", { userId }))}
      >
        📵 {msg.disconnect}
      </button>
      {error && (
        <div style={{ padding: "4px 8px", fontSize: 12, color: "var(--destructive, #ef4444)" }}>
          {error}
        </div>
      )}
    </div>
  );
});

export { ModerationItems };
