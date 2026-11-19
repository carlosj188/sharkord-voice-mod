import { useStoreSelector } from "@sharkord/plugin-sdk/client";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { closeNativeMenu, findCard, findRow, waitForNativeMenu } from "./dom";
import { ModerationItems } from "./moderation-items";

type TProps = { channelId: number; userId: number };
type TPoint = { x: number; y: number };

/** our own menu, for the call screen card, where the host has none */
const FloatingMenu = ({
  x,
  y,
  userId,
  channelId,
  onClose,
}: TPoint & TProps & { onClose: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e.type === "mousedown" && ref.current?.contains(e.target as Node)) return;
      onClose();
    };

    document.addEventListener("mousedown", close, true);
    document.addEventListener("keydown", close, true);
    window.addEventListener("blur", onClose);
    return () => {
      document.removeEventListener("mousedown", close, true);
      document.removeEventListener("keydown", close, true);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      className="bg-popover text-popover-foreground border border-border rounded-md shadow-md p-1"
      style={{
        position: "fixed",
        left: Math.min(x, window.innerWidth - 240),
        top: Math.min(y, window.innerHeight - 120),
        zIndex: 9999,
        minWidth: 220,
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <ModerationItems userId={userId} channelId={channelId} onDone={onClose} />
    </div>,
    document.body,
  );
};

/**
 * Rendered in VOICE_USER_ROW and VOICE_USER_CARD. There is no context-menu
 * slot, so it walks up from its own (hidden) element to the row or card and
 * listens for right-clicks there.
 */
const VoiceUserMenu = memo(({ channelId, userId }: TProps) => {
  const ownUserId = useStoreSelector((state) => state.ownUserId);
  const anchor = useRef<HTMLSpanElement>(null);
  const [nativeMenu, setNativeMenu] = useState<HTMLElement | null>(null);
  const [floating, setFloating] = useState<TPoint | null>(null);
  const isSelf = userId === ownUserId;

  useEffect(() => {
    if (isSelf) return;

    const row = findRow(anchor.current);
    const card = row ? null : findCard(anchor.current);
    const target = row ?? card;
    if (!target) return;

    const onContextMenu = (e: MouseEvent) => {
      if (row) {
        // never cancel this event: the host's volume menu opens from it. We
        // wait for that menu and add our items under the volume slider.
        waitForNativeMenu(setNativeMenu);
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      setFloating({ x: e.clientX, y: e.clientY });
    };

    target.addEventListener("contextmenu", onContextMenu);
    return () => target.removeEventListener("contextmenu", onContextMenu);
  }, [isSelf]);

  // the host menu leaves the DOM when it closes: let go of the portal
  useEffect(() => {
    if (!nativeMenu) return;

    const observer = new MutationObserver(() => {
      if (!nativeMenu.isConnected || nativeMenu.getAttribute("data-state") !== "open") {
        setNativeMenu(null);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });
    return () => observer.disconnect();
  }, [nativeMenu]);

  const closeFloating = useCallback(() => setFloating(null), []);

  return (
    <span ref={anchor} style={{ display: "none" }}>
      {!isSelf &&
        nativeMenu &&
        createPortal(
          <ModerationItems
            userId={userId}
            channelId={channelId}
            onDone={() => closeNativeMenu(nativeMenu)}
          />,
          nativeMenu,
        )}
      {!isSelf && floating && (
        <FloatingMenu
          {...floating}
          userId={userId}
          channelId={channelId}
          onClose={closeFloating}
        />
      )}
    </span>
  );
});

export { VoiceUserMenu };
