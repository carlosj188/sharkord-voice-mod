# AGENTS.md

This repo is a **Sharkord plugin** built from the official
[plugin-example](https://github.com/Sharkord/plugin-example) scaffold.

- `src/server/index.ts` runs inside the Sharkord server: the actions and slash
  commands that disconnect and server-mute, all behind `MOVE_MEMBERS`.
- `src/client/` holds the React components rendered in the `voice_user_row`,
  `voice_user_card` and `user_popover` slots.
- `src/types.ts` is the contract both halves share; `src/i18n.ts` holds every
  user-facing string in English and Brazilian Portuguese.

## Things to keep in mind

- **The right-click integration is not an SDK API.** There is no context-menu
  slot, so `src/client/dom.ts` finds the voice row and the host's Radix menu by
  their markup. Keep every DOM assumption in that file, and never call
  `preventDefault` on the row's `contextmenu`: that removes the host's volume
  menu.
- **Restoring the mic clicks the host's own mic button**, found by its lucide
  icon (`svg.lucide-mic-off`). There is no SDK action for the user's own mic.
- Any string shown to people goes in `src/i18n.ts`, in both languages.

The plugin SDK lives in the Sharkord monorepo, cloned into `.repos/sharkord` by
`bun run setup`. Read [.repos/sharkord/AGENTS.md](.repos/sharkord/AGENTS.md) if
present.
