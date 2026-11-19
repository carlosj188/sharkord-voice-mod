type TLang = "en" | "pt";

const messages = {
  en: {
    mute: "Mute (server)",
    unmute: "Unmute (server)",
    disconnect: "Disconnect from call",
    noName: "Name the person, for example /disconnect alice.",
    ambiguous: (query: string, names: string) =>
      `More than one user starts with "${query}": ${names}.`,
    notFound: (query: string) => `No user named "${query}".`,
    selfDisconnect: "To leave the call, use your own disconnect button.",
    selfMute: "You can't server-mute yourself.",
    notInVoice: (name: string) => `${name} is not in a voice channel.`,
    disconnected: (name: string) => `${name} was disconnected from the call.`,
    muted: (name: string) => `${name} was server-muted.`,
    unmuted: (name: string) => `${name} was unmuted.`,
    cmdDisconnect: "Takes someone out of the call, without kicking them",
    cmdMute: "Server mute: they can't unmute themselves",
    cmdUnmute: "Lifts the server mute",
    argUser: "The person's name",
  },
  pt: {
    mute: "Mutar (servidor)",
    unmute: "Desmutar (servidor)",
    disconnect: "Desconectar da call",
    noName: "Diga o nome da pessoa, por exemplo /desconectar alice.",
    ambiguous: (query: string, names: string) =>
      `Mais de um usuário começa com "${query}": ${names}.`,
    notFound: (query: string) => `Nenhum usuário chamado "${query}".`,
    selfDisconnect: "Para sair da call, use o seu próprio botão de desconectar.",
    selfMute: "Não dá para aplicar mute de servidor em si mesmo.",
    notInVoice: (name: string) => `${name} não está em nenhuma call.`,
    disconnected: (name: string) => `${name} foi desconectado da call.`,
    muted: (name: string) => `${name} foi mutado pelo servidor.`,
    unmuted: (name: string) => `${name} foi desmutado.`,
    cmdDisconnect: "Tira alguém da call, sem expulsar do servidor",
    cmdMute: "Mute de servidor: a pessoa não consegue se desmutar",
    cmdUnmute: "Tira o mute de servidor",
    argUser: "Nome da pessoa",
  },
} satisfies Record<TLang, unknown>;

type TMessages = (typeof messages)["en"];

/** Sharkord locales are like `en` or `pt-BR`; anything Portuguese gets pt */
const langOf = (locale: string | undefined): TLang =>
  locale?.toLowerCase().startsWith("pt") ? "pt" : "en";

const t = (locale: string | undefined): TMessages => messages[langOf(locale)];

export { langOf, messages, t };
export type { TLang, TMessages };
