/** where a user is in voice, as the moderation UI needs it */
type TVoiceTarget = { channelId: number; serverMuted: boolean };

type TUserArgs = { user: string };

/**
 * The contract between the server and client halves. Commands come in English
 * and Brazilian Portuguese, with the same behaviour.
 */
type TPlugin = {
  actions: {
    voiceState: {
      payload: { userId: number; channelId?: number };
      response: TVoiceTarget | null;
    };
    disconnectUser: { payload: { userId: number }; response: true };
    setMute: { payload: { userId: number; muted: boolean }; response: true };
  };
  commands: {
    disconnect: { args: TUserArgs; response: string };
    mute: { args: TUserArgs; response: string };
    unmute: { args: TUserArgs; response: string };
    desconectar: { args: TUserArgs; response: string };
    mutar: { args: TUserArgs; response: string };
    desmutar: { args: TUserArgs; response: string };
  };
  /** tells a user who was server-unmuted to turn their own mic back on */
  push: { type: "restore-mic" };
};

export type { TPlugin, TUserArgs, TVoiceTarget };
