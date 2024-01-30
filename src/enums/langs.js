export const EWebLangs = Object.freeze({
  enUS: "en-US",
  zhTW: "zh-TW",
  zhCN: "zh-CN",
  koKR: "ko-KR",
  jaJP: "ja-JP",
  viVN: "vi-VN",
  idID: "id-ID",
  ruRU: "ru-RU",
  trTR: "tr-TR",
  ptPT: "pt-PT",
  esES: "es-ES",
  faIR: "fa-IR",
  itIT: "it-IT",
  deDE: "de-DE",
  filPH: "fil-PH",
  frFR: "fr-FR",
  thTH: "th-TH",
  ukUA: "uk-UA",
});

// 為歷史相容，保留舊的變數名稱
export const ELangs = EWebLangs;

export const EWebLangTranslates = Object.freeze({
  [ELangs.enUS]: "English",
  [ELangs.zhCN]: "简体中文",
  [ELangs.zhTW]: "繁体中文",
  [ELangs.koKR]: "한국어",
  [ELangs.jaJP]: "日本语",
  [ELangs.viVN]: "Tiếng Việt",
  [ELangs.idID]: "Bahasa Indonesia",
  [ELangs.ruRU]: "Pусский",
  [ELangs.trTR]: "Türkçe",
  [ELangs.ptPT]: "Português",
  [ELangs.esES]: "Español",
  [ELangs.faIR]: "فارسی",
  [ELangs.itIT]: "Italiano",
  [ELangs.deDE]: "Deutsch",
  [ELangs.filPH]: "Filipino",
  [ELangs.frFR]: "Français",
  [ELangs.thTH]: "ภาษาไทย",
  [ELangs.ukUA]: "Українська",
});

// 為歷史相容，保留舊的變數名稱
export const ELangTranslates = EWebLangTranslates;

export const ETranslateToLanguage = Object.freeze({
  [ELangs.enUS]: "en",
  [ELangs.zhCN]: "zh",
});
