/**
 * Internationalization (i18n) Service for ǝterrn
 *
 * Lightweight i18n using a simple key-value dictionary approach.
 * Supports: English (default), Spanish, French, Portuguese, Chinese, Arabic
 *
 * Usage:
 *   import { t, setLocale } from "@foreverr/core";
 *   <Text>{t("welcome")}</Text>
 *   setLocale("es"); // Switch to Spanish
 */

import { Platform, NativeModules } from "react-native";

// ── Types ──────────────────────────────────────────────────

export type SupportedLocale = "en" | "es" | "fr" | "pt" | "zh" | "ar";

type TranslationDict = Record<string, string>;

// ── Translations ───────────────────────────────────────────

const translations: Record<SupportedLocale, TranslationDict> = {
  en: {
    // Common
    welcome: "Welcome",
    loading: "Loading...",
    error: "Something went wrong",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    share: "Share",
    search: "Search",
    back: "Back",
    done: "Done",
    next: "Next",
    skip: "Skip",
    or: "or",
    and: "and",
    see_all: "See All",
    learn_more: "Learn More",

    // Auth
    sign_in: "Sign In",
    sign_up: "Sign Up",
    sign_out: "Sign Out",
    email: "Email",
    password: "Password",
    forgot_password: "Forgot Password?",

    // Tabs
    tab_home: "The Orbit",
    tab_explore: "Explore",
    tab_create: "Create",
    tab_notifications: "Echoes",
    tab_profile: "Profile",

    // Memorials
    memorial: "Memorial",
    memorials: "Memorials",
    create_memorial: "Create Memorial",
    tribute: "Tribute",
    tributes: "Tributes",
    light_candle: "Light a Candle",
    leave_tribute: "Leave a Tribute",

    // Timeline
    life_timeline: "The Arc",
    add_event: "Add Event",
    milestones: "Turning Points",
    add_milestone: "Add Turning Point",

    // Photos
    photo_tags: "Photo Tags",
    tag_someone: "Tag Someone",
    people_in_photos: "People in Photos",

    // Social
    follow: "Follow",
    following: "Following",
    followers: "Followers",
    send_gift: "Send Gift",
    give_flowers: "Give Flowers",

    // Premium
    premium: "Premium",
    upgrade: "Upgrade",
    subscribe: "Subscribe",
    restore_purchases: "Restore Purchases",

    // Reminders
    reminders: "Reminders",
    birthday_reminder: "Birthday Reminder",
    anniversary_reminder: "Anniversary Reminder",

    // App-specific
    eterrn_tagline: "Honor. Life. Forever.",
    celebrate_preserve_remember: "Celebrate, Preserve, Remember",
    no_results: "No results found",
    empty_state: "Nothing here yet",
  },

  es: {
    welcome: "Bienvenido",
    loading: "Cargando...",
    error: "Algo sali\u00f3 mal",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    share: "Compartir",
    search: "Buscar",
    back: "Atr\u00e1s",
    done: "Hecho",
    next: "Siguiente",
    skip: "Omitir",
    or: "o",
    and: "y",
    see_all: "Ver Todo",
    learn_more: "Saber M\u00e1s",
    sign_in: "Iniciar Sesi\u00f3n",
    sign_up: "Registrarse",
    sign_out: "Cerrar Sesi\u00f3n",
    email: "Correo",
    password: "Contrase\u00f1a",
    forgot_password: "\u00bfOlvidaste tu contrase\u00f1a?",
    tab_home: "The Orbit",
    tab_explore: "Explorar",
    tab_create: "Crear",
    tab_notifications: "Echoes",
    tab_profile: "Perfil",
    memorial: "Memorial",
    memorials: "Memoriales",
    create_memorial: "Crear Memorial",
    tribute: "Tributo",
    tributes: "Tributos",
    light_candle: "Encender una Vela",
    leave_tribute: "Dejar un Tributo",
    life_timeline: "The Arc",
    add_event: "Agregar Evento",
    milestones: "Turning Points",
    add_milestone: "Add Turning Point",
    photo_tags: "Etiquetas de Fotos",
    tag_someone: "Etiquetar a Alguien",
    people_in_photos: "Personas en Fotos",
    follow: "Seguir",
    following: "Siguiendo",
    followers: "Seguidores",
    send_gift: "Enviar Regalo",
    give_flowers: "Dar Flores",
    premium: "Premium",
    upgrade: "Mejorar",
    subscribe: "Suscribirse",
    restore_purchases: "Restaurar Compras",
    reminders: "Recordatorios",
    birthday_reminder: "Recordatorio de Cumplea\u00f1os",
    anniversary_reminder: "Recordatorio de Aniversario",
    eterrn_tagline: "Honor. Life. Forever.",
    celebrate_preserve_remember: "Celebrar, Preservar, Recordar",
    no_results: "No se encontraron resultados",
    empty_state: "Nada aqu\u00ed todav\u00eda",
  },

  fr: {
    // Common
    welcome: "Bienvenue",
    loading: "Chargement...",
    error: "Quelque chose s'est mal pass\u00e9",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    share: "Partager",
    search: "Rechercher",
    back: "Retour",
    done: "Termin\u00e9",
    next: "Suivant",
    skip: "Passer",
    or: "ou",
    and: "et",
    see_all: "Tout Voir",
    learn_more: "En Savoir Plus",
    // Auth
    sign_in: "Se Connecter",
    sign_up: "S'inscrire",
    sign_out: "Se D\u00e9connecter",
    email: "E-mail",
    password: "Mot de passe",
    forgot_password: "Mot de passe oubli\u00e9 ?",
    // Tabs
    tab_home: "The Orbit",
    tab_explore: "Explorer",
    tab_create: "Cr\u00e9er",
    tab_notifications: "Echoes",
    tab_profile: "Profil",
    // Memorials
    memorial: "M\u00e9morial",
    memorials: "M\u00e9moriaux",
    create_memorial: "Cr\u00e9er un M\u00e9morial",
    tribute: "Hommage",
    tributes: "Hommages",
    light_candle: "Allumer une Bougie",
    leave_tribute: "Laisser un Hommage",
    // Timeline
    life_timeline: "The Arc",
    add_event: "Ajouter un \u00c9v\u00e9nement",
    milestones: "Turning Points",
    add_milestone: "Add Turning Point",
    // Photos
    photo_tags: "Tags Photo",
    tag_someone: "Identifier Quelqu'un",
    people_in_photos: "Personnes sur les Photos",
    // Social
    follow: "Suivre",
    following: "Abonn\u00e9",
    followers: "Abonn\u00e9s",
    send_gift: "Envoyer un Cadeau",
    give_flowers: "Offrir des Fleurs",
    // Premium
    premium: "Premium",
    upgrade: "Am\u00e9liorer",
    subscribe: "S'abonner",
    restore_purchases: "Restaurer les Achats",
    // Reminders
    reminders: "Rappels",
    birthday_reminder: "Rappel d'Anniversaire",
    anniversary_reminder: "Rappel de Comm\u00e9moration",
    // App-specific
    eterrn_tagline: "Honor. Life. Forever.",
    celebrate_preserve_remember: "C\u00e9l\u00e9brer, Pr\u00e9server, Se Souvenir",
    no_results: "Aucun r\u00e9sultat trouv\u00e9",
    empty_state: "Rien ici pour le moment",
  },

  pt: {
    // Common
    welcome: "Bem-vindo",
    loading: "Carregando...",
    error: "Algo deu errado",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    share: "Compartilhar",
    search: "Buscar",
    back: "Voltar",
    done: "Conclu\u00eddo",
    next: "Pr\u00f3ximo",
    skip: "Pular",
    or: "ou",
    and: "e",
    see_all: "Ver Tudo",
    learn_more: "Saiba Mais",
    // Auth
    sign_in: "Entrar",
    sign_up: "Cadastrar",
    sign_out: "Sair",
    email: "E-mail",
    password: "Senha",
    forgot_password: "Esqueceu a senha?",
    // Tabs
    tab_home: "The Orbit",
    tab_explore: "Explorar",
    tab_create: "Criar",
    tab_notifications: "Echoes",
    tab_profile: "Perfil",
    // Memorials
    memorial: "Memorial",
    memorials: "Memoriais",
    create_memorial: "Criar Memorial",
    tribute: "Tributo",
    tributes: "Tributos",
    light_candle: "Acender uma Vela",
    leave_tribute: "Deixar um Tributo",
    // Timeline
    life_timeline: "The Arc",
    add_event: "Adicionar Evento",
    milestones: "Turning Points",
    add_milestone: "Adicionar Turning Point",
    // Photos
    photo_tags: "Tags de Fotos",
    tag_someone: "Marcar Algu\u00e9m",
    people_in_photos: "Pessoas nas Fotos",
    // Social
    follow: "Seguir",
    following: "Seguindo",
    followers: "Seguidores",
    send_gift: "Enviar Presente",
    give_flowers: "Dar Flores",
    // Premium
    premium: "Premium",
    upgrade: "Melhorar",
    subscribe: "Assinar",
    restore_purchases: "Restaurar Compras",
    // Reminders
    reminders: "Lembretes",
    birthday_reminder: "Lembrete de Anivers\u00e1rio",
    anniversary_reminder: "Lembrete de Comemora\u00e7\u00e3o",
    // App-specific
    eterrn_tagline: "Honor. Life. Forever.",
    celebrate_preserve_remember: "Celebrar, Preservar, Lembrar",
    no_results: "Nenhum resultado encontrado",
    empty_state: "Nada aqui ainda",
  },

  zh: {
    // Common
    welcome: "\u6b22\u8fce",
    loading: "\u52a0\u8f7d\u4e2d...",
    error: "\u51fa\u4e86\u70b9\u95ee\u9898",
    save: "\u4fdd\u5b58",
    cancel: "\u53d6\u6d88",
    delete: "\u5220\u9664",
    edit: "\u7f16\u8f91",
    share: "\u5206\u4eab",
    search: "\u641c\u7d22",
    back: "\u8fd4\u56de",
    done: "\u5b8c\u6210",
    next: "\u4e0b\u4e00\u6b65",
    skip: "\u8df3\u8fc7",
    or: "\u6216",
    and: "\u548c",
    see_all: "\u67e5\u770b\u5168\u90e8",
    learn_more: "\u4e86\u89e3\u66f4\u591a",
    // Auth
    sign_in: "\u767b\u5f55",
    sign_up: "\u6ce8\u518c",
    sign_out: "\u9000\u51fa\u767b\u5f55",
    email: "\u7535\u5b50\u90ae\u4ef6",
    password: "\u5bc6\u7801",
    forgot_password: "\u5fd8\u8bb0\u5bc6\u7801\uff1f",
    // Tabs
    tab_home: "The Orbit",
    tab_explore: "\u53d1\u73b0",
    tab_create: "\u521b\u5efa",
    tab_notifications: "Echoes",
    tab_profile: "\u4e2a\u4eba",
    // Memorials
    memorial: "\u7eaa\u5ff5",
    memorials: "\u7eaa\u5ff5\u9986",
    create_memorial: "\u521b\u5efa\u7eaa\u5ff5",
    tribute: "\u81f4\u656c",
    tributes: "\u81f4\u656c\u8bcd",
    light_candle: "\u70b9\u71c3\u8721\u70db",
    leave_tribute: "\u7559\u4e0b\u81f4\u656c",
    // Timeline
    life_timeline: "The Arc",
    add_event: "\u6dfb\u52a0\u4e8b\u4ef6",
    milestones: "Turning Points",
    add_milestone: "Add Turning Point",
    // Photos
    photo_tags: "\u7167\u7247\u6807\u7b7e",
    tag_someone: "\u6807\u8bb0\u67d0\u4eba",
    people_in_photos: "\u7167\u7247\u4e2d\u7684\u4eba\u7269",
    // Social
    follow: "\u5173\u6ce8",
    following: "\u5df2\u5173\u6ce8",
    followers: "\u7c89\u4e1d",
    send_gift: "\u9001\u793c\u7269",
    give_flowers: "\u9001\u82b1",
    // Premium
    premium: "\u9ad8\u7ea7\u7248",
    upgrade: "\u5347\u7ea7",
    subscribe: "\u8ba2\u9605",
    restore_purchases: "\u6062\u590d\u8d2d\u4e70",
    // Reminders
    reminders: "\u63d0\u9192",
    birthday_reminder: "\u751f\u65e5\u63d0\u9192",
    anniversary_reminder: "\u7eaa\u5ff5\u65e5\u63d0\u9192",
    // App-specific
    eterrn_tagline: "Honor. Life. Forever.",
    celebrate_preserve_remember: "\u5e86\u795d\u3001\u4fdd\u5b58\u3001\u7eaa\u5ff5",
    no_results: "\u672a\u627e\u5230\u7ed3\u679c",
    empty_state: "\u8fd9\u91cc\u8fd8\u6ca1\u6709\u5185\u5bb9",
  },

  ar: {
    // Common
    welcome: "\u0623\u0647\u0644\u0627\u064b",
    loading: "\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0645\u064a\u0644...",
    error: "\u062d\u062f\u062b \u062e\u0637\u0623 \u0645\u0627",
    save: "\u062d\u0641\u0638",
    cancel: "\u0625\u0644\u063a\u0627\u0621",
    delete: "\u062d\u0630\u0641",
    edit: "\u062a\u0639\u062f\u064a\u0644",
    share: "\u0645\u0634\u0627\u0631\u0643\u0629",
    search: "\u0628\u062d\u062b",
    back: "\u0631\u062c\u0648\u0639",
    done: "\u062a\u0645",
    next: "\u0627\u0644\u062a\u0627\u0644\u064a",
    skip: "\u062a\u062e\u0637\u064a",
    or: "\u0623\u0648",
    and: "\u0648",
    see_all: "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644",
    learn_more: "\u0627\u0639\u0631\u0641 \u0627\u0644\u0645\u0632\u064a\u062f",
    // Auth
    sign_in: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
    sign_up: "\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628",
    sign_out: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c",
    email: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
    password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    forgot_password: "\u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061f",
    // Tabs
    tab_home: "The Orbit",
    tab_explore: "\u0627\u0633\u062a\u0643\u0634\u0641",
    tab_create: "\u0625\u0646\u0634\u0627\u0621",
    tab_notifications: "Echoes",
    tab_profile: "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a",
    // Memorials
    memorial: "\u062a\u0630\u0643\u0627\u0631\u064a",
    memorials: "\u062a\u0630\u0643\u0627\u0631\u064a\u0627\u062a",
    create_memorial: "\u0625\u0646\u0634\u0627\u0621 \u062a\u0630\u0643\u0627\u0631\u064a",
    tribute: "\u062a\u0643\u0631\u064a\u0645",
    tributes: "\u062a\u0643\u0631\u064a\u0645\u0627\u062a",
    light_candle: "\u0625\u0636\u0627\u0621\u0629 \u0634\u0645\u0639\u0629",
    leave_tribute: "\u062a\u0631\u0643 \u062a\u0643\u0631\u064a\u0645",
    // Timeline
    life_timeline: "The Arc",
    add_event: "\u0625\u0636\u0627\u0641\u0629 \u062d\u062f\u062b",
    milestones: "Turning Points",
    add_milestone: "Add Turning Point",
    // Photos
    photo_tags: "\u0639\u0644\u0627\u0645\u0627\u062a \u0627\u0644\u0635\u0648\u0631",
    tag_someone: "\u0648\u0633\u0645 \u0634\u062e\u0635",
    people_in_photos: "\u0627\u0644\u0623\u0634\u062e\u0627\u0635 \u0641\u064a \u0627\u0644\u0635\u0648\u0631",
    // Social
    follow: "\u0645\u062a\u0627\u0628\u0639\u0629",
    following: "\u064a\u062a\u0627\u0628\u0639",
    followers: "\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0648\u0646",
    send_gift: "\u0625\u0631\u0633\u0627\u0644 \u0647\u062f\u064a\u0629",
    give_flowers: "\u0625\u0631\u0633\u0627\u0644 \u0632\u0647\u0648\u0631",
    // Premium
    premium: "\u0645\u0645\u064a\u0632",
    upgrade: "\u062a\u0631\u0642\u064a\u0629",
    subscribe: "\u0627\u0634\u062a\u0631\u0627\u0643",
    restore_purchases: "\u0627\u0633\u062a\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u0634\u062a\u0631\u064a\u0627\u062a",
    // Reminders
    reminders: "\u062a\u0630\u0643\u064a\u0631\u0627\u062a",
    birthday_reminder: "\u062a\u0630\u0643\u064a\u0631 \u0639\u064a\u062f \u0627\u0644\u0645\u064a\u0644\u0627\u062f",
    anniversary_reminder: "\u062a\u0630\u0643\u064a\u0631 \u0627\u0644\u0630\u0643\u0631\u0649",
    // App-specific
    eterrn_tagline: "Honor. Life. Forever.",
    celebrate_preserve_remember: "\u0627\u062d\u062a\u0641\u0644\u060c \u0627\u062d\u0641\u0638\u060c \u062a\u0630\u0643\u0631",
    no_results: "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0646\u062a\u0627\u0626\u062c",
    empty_state: "\u0644\u0627 \u064a\u0648\u062c\u062f \u0634\u064a\u0621 \u0647\u0646\u0627 \u0628\u0639\u062f",
  },
};

// ── State ──────────────────────────────────────────────────

let currentLocale: SupportedLocale = "en";

// ── Detect device locale ───────────────────────────────────

function detectLocale(): SupportedLocale {
  try {
    let deviceLocale = "en";

    if (Platform.OS === "ios") {
      deviceLocale = NativeModules.SettingsManager?.settings?.AppleLocale ??
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ?? "en";
    } else if (Platform.OS === "android") {
      deviceLocale = NativeModules.I18nManager?.localeIdentifier ?? "en";
    } else {
      deviceLocale = typeof navigator !== "undefined" ? navigator.language : "en";
    }

    const shortCode = deviceLocale.split(/[-_]/)[0].toLowerCase();
    if (shortCode in translations) return shortCode as SupportedLocale;
  } catch {}
  return "en";
}

// ── Public API ──────────────────────────────────────────────

/**
 * Translate a key to the current locale.
 * Falls back to English if key is missing in target locale.
 */
export function t(key: string, replacements?: Record<string, string>): string {
  let text = translations[currentLocale]?.[key] ?? translations.en[key] ?? key;

  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      text = text.replace(`{${k}}`, v);
    }
  }

  return text;
}

/**
 * Set the current locale.
 */
export function setLocale(locale: SupportedLocale) {
  if (locale in translations) {
    currentLocale = locale;
  }
}

/**
 * Get the current locale.
 */
export function getLocale(): SupportedLocale {
  return currentLocale;
}

/**
 * Get all supported locales.
 */
export function getSupportedLocales(): Array<{ code: SupportedLocale; label: string }> {
  return [
    { code: "en", label: "English" },
    { code: "es", label: "Espa\u00f1ol" },
    { code: "fr", label: "Fran\u00e7ais" },
    { code: "pt", label: "Portugu\u00eas" },
    { code: "zh", label: "\u4e2d\u6587" },
    { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
  ];
}

/**
 * Initialize i18n with device locale detection.
 */
export function initI18n() {
  currentLocale = detectLocale();
}

// Auto-init
initI18n();
