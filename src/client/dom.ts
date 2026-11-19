// Every assumption about Sharkord's own markup lives here. None of it is SDK
// API: if a Sharkord update changes this markup, the right-click items and the
// mic restore stop working, while the popover buttons and the slash commands
// keep working.

/** a voice row in the sidebar, which the host wraps in its volume menu */
const findRow = (el: Element | null) =>
  el?.closest<HTMLElement>('[class*="hover:bg-accent/30"]') ?? null;

/** a user's card on the call screen, which has no native menu */
const findCard = (el: Element | null) =>
  el?.closest<HTMLElement>('[class*="group/voice-user-card"]') ?? null;

/** the host's context menu (Radix) opens in a portal right after the click */
const waitForNativeMenu = (onFound: (menu: HTMLElement) => void) => {
  let frames = 0;

  const tick = () => {
    const menus = document.querySelectorAll<HTMLElement>(
      '[role="menu"][data-state="open"]',
    );
    const menu = menus[menus.length - 1];
    if (menu) return onFound(menu);
    if (++frames < 30) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

/** closes the host menu the way Radix expects */
const closeNativeMenu = (menu: HTMLElement) =>
  menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

/** the user's own mic button while it shows as muted */
const findMutedMicButton = () =>
  [...document.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => !button.disabled && button.querySelector("svg.lucide-mic-off"),
  );

/** same look as the host's menu items (they come from @sharkord/ui) */
const menuItemClass =
  "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none";

export {
  closeNativeMenu,
  findCard,
  findMutedMicButton,
  findRow,
  menuItemClass,
  waitForNativeMenu,
};
