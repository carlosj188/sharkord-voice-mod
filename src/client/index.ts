import { PluginSlot } from "@sharkord/plugin-sdk";
import type { TPluginComponentsMapBySlotId } from "@sharkord/plugin-sdk/client";
import { PopoverButtons } from "./popover-buttons";
import { listenForRestoreMic } from "./restore-mic";
import { VoiceUserMenu } from "./voice-user-menu";

listenForRestoreMic();

const components: TPluginComponentsMapBySlotId = {
  [PluginSlot.VOICE_USER_ROW]: [VoiceUserMenu],
  [PluginSlot.VOICE_USER_CARD]: [VoiceUserMenu],
  [PluginSlot.USER_POPOVER]: [PopoverButtons],
};

export { components };
