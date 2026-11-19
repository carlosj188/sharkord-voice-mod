import {
  ChannelType,
  Permission,
  PluginSlot,
  type PluginContext,
  type TUpgradeInfo,
  type UnloadPluginContext,
  type UpgradePluginContext,
} from "@sharkord/plugin-sdk";
import { t, type TMessages } from "../i18n";
import type { TPlugin, TVoiceTarget } from "../types";

// Sharkord has no native "disconnect from voice" or "server mute" for other
// users, only kick and move. The SDK does: ctx.voice.disconnect and
// ctx.voice.setServerMute. Everything here requires the same permission as
// moving members between voice channels.
const PERMISSION = Permission.MOVE_MEMBERS;

type TContext = PluginContext<TPlugin>;
type TInvoker = { userId: number; locale: string };

const findVoiceUser = async (
  ctx: TContext,
  userId: number,
  channelId?: number,
): Promise<TVoiceTarget | null> => {
  const candidates = channelId
    ? [channelId]
    : (await ctx.channels.list())
        .filter((channel) => channel.type === ChannelType.VOICE)
        .map((channel) => channel.id);

  for (const id of candidates) {
    let state;
    try {
      state = ctx.voice.getState(id);
    } catch {
      // no live voice runtime in this channel
      continue;
    }

    const user = state.users.find((u) => u.userId === userId);
    if (user) return { channelId: id, serverMuted: !!user.state.serverMuted };
  }

  return null;
};

const resolveUser = async (ctx: TContext, msg: TMessages, query: string) => {
  const wanted = String(query ?? "").trim().replace(/^@/, "").toLowerCase();
  if (!wanted) throw new Error(msg.noName);

  const users = await ctx.users.list();
  const exact = users.filter((u) => u.name.toLowerCase() === wanted);
  if (exact.length === 1) return exact[0]!;

  const partial = users.filter((u) => u.name.toLowerCase().startsWith(wanted));
  if (partial.length === 1) return partial[0]!;
  if (partial.length > 1) {
    throw new Error(msg.ambiguous(query, partial.map((u) => u.name).join(", ")));
  }

  throw new Error(msg.notFound(query));
};

const onLoad = async (ctx: TContext) => {
  // Server mute also turns on the user's own micMuted, and lifting it does not
  // turn it off. We remember who had their mic on, and on unmute tell their
  // client to switch it back on.
  const micWasOn = new Set<number>();

  const disconnect = async (invoker: TInvoker, userId: number) => {
    const msg = t(invoker.locale);
    if (userId === invoker.userId) throw new Error(msg.selfDisconnect);

    await ctx.voice.disconnect(userId);
    ctx.logger.log(`User ${invoker.userId} disconnected user ${userId} from voice`);
  };

  const setMute = async (invoker: TInvoker, userId: number, muted: boolean) => {
    const msg = t(invoker.locale);
    if (userId === invoker.userId) throw new Error(msg.selfMute);

    if (muted) {
      const where = await findVoiceUser(ctx, userId);
      const state =
        where &&
        ctx.voice.getState(where.channelId).users.find((u) => u.userId === userId)
          ?.state;
      if (state && !state.micMuted && !state.serverMuted) micWasOn.add(userId);
    }

    await ctx.voice.setServerMute(userId, muted);

    if (!muted && micWasOn.delete(userId)) {
      ctx.push.toUser(userId, { type: "restore-mic" });
    }

    ctx.logger.log(
      `User ${invoker.userId} ${muted ? "muted" : "unmuted"} user ${userId} (server)`,
    );
  };

  ctx.actions.register({
    name: "voiceState",
    requires: PERMISSION,
    executes: (_invoker, payload) =>
      findVoiceUser(ctx, payload.userId, payload.channelId),
  });

  ctx.actions.register({
    name: "disconnectUser",
    requires: PERMISSION,
    executes: async (invoker, payload) => {
      await disconnect(invoker, payload.userId);
      return true;
    },
  });

  ctx.actions.register({
    name: "setMute",
    requires: PERMISSION,
    executes: async (invoker, payload) => {
      await setMute(invoker, payload.userId, !!payload.muted);
      return true;
    },
  });

  // the same commands in English and Brazilian Portuguese
  const commands = [
    { names: ["disconnect", "desconectar"], kind: "disconnect" },
    { names: ["mute", "mutar"], kind: "mute" },
    { names: ["unmute", "desmutar"], kind: "unmute" },
  ] as const;

  for (const { names, kind } of commands) {
    for (const name of names) {
      const msg = t(name === names[0] ? "en" : "pt");
      const description = {
        disconnect: msg.cmdDisconnect,
        mute: msg.cmdMute,
        unmute: msg.cmdUnmute,
      }[kind];

      ctx.commands.register({
        name,
        description,
        args: [{ name: "user", description: msg.argUser, type: "string", required: true }],
        requires: PERMISSION,
        ephemeral: true,
        executes: async (invoker, args) => {
          const reply = t(invoker.locale);
          const user = await resolveUser(ctx, reply, args.user);

          if (!(await findVoiceUser(ctx, user.id))) {
            throw new Error(reply.notInVoice(user.name));
          }

          if (kind === "disconnect") {
            await disconnect(invoker, user.id);
            return reply.disconnected(user.name);
          }

          await setMute(invoker, user.id, kind === "mute");
          return kind === "mute" ? reply.muted(user.name) : reply.unmuted(user.name);
        },
      });
    }
  }

  // components only render for users who hold the permission. The client
  // bundle still loads for everyone, which is what lets restore-mic reach a
  // muted user who cannot moderate.
  ctx.ui.enable({
    [PluginSlot.VOICE_USER_ROW]: PERMISSION,
    [PluginSlot.VOICE_USER_CARD]: PERMISSION,
    [PluginSlot.USER_POPOVER]: PERMISSION,
  });

  ctx.logger.log("Voice moderation loaded");
};

const onUnload = (ctx: UnloadPluginContext) => {
  ctx.logger.log("Voice moderation unloaded");
};

const onUpgrade = (ctx: UpgradePluginContext, info: TUpgradeInfo) => {
  ctx.logger.log(`Upgraded from ${info.previousVersion} to ${info.version}`);
};

export { onLoad, onUnload, onUpgrade };
