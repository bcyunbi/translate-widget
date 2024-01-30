export interface AlertText {
  title: string;
  message: string;
}

/**
 * Based on: https://cloud.google.com/translate/docs/reference/rest/v3/SupportedLanguages#SupportedLanguage
 */
export interface SupportedLanguage {
  languageCode: string;
  displayName: string;
}

export type TranslatedTextMap = { [languageCode: string]: string | undefined };
export type TranslationStatusMap = {
  [languageCode: string]: TranslationStatus | undefined;
};

export enum TranslationStatus {
  NotTranslated = 0,
  InProgress = 1,
  Translated = 2,
}

export const DEFAULT_LANGUAGE_CODE = "zh";
export const translateLanguageCodeKey = "translateLanguageCode";
export const mountLocationId = "translate_widget_element";
/**
 * Internal reference used to hot-swap text
 */
export interface TranslatedNode {
  originalText: string;
  currentLanguage: string;
  translatedText: TranslatedTextMap;
  translationStatus: TranslationStatusMap;
  node: Node;
  isIntersecting: boolean;
  nearestVisibleAncestor: HTMLElement | null;
  attribute: string;
}
export type LanguageCodeState = {
  languageCode: string;
};

export interface DropdownOptions {
  // The source language of the document
  pageLanguage: string;
  // Limit the number of supported languages to only those found in this array
  // The array should contain the languageCode which corresponds to the intended language
  preferredSupportedLanguages: string[];
  /**
   * Translations are done in batches instead of all at once.
   * Batches are made to prevent an API error of translating too many
   * things at once. This parameter specifies the size of each batch,
   * in the number of Nodes processed.
   */
  chunkSize: number;
  /**
   * A single number between 0.0 and 1.0, specifying a ratio of intersection area to total bounding box area for the observed target.
   * A value of 0.0 means that even a single visible pixel counts as the target being visible.
   * 1.0 means that the entire target element is visible.
   * See: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver
   */
  intersectionThreshold: number;
  /**
   * Translations will be made to elements, even if they aren't detected to be intersecting with the page.
   * The behavior of this option is untested and isn't recommended.
   */
  ignoreIntersection: boolean;
  /**
   * Classes to ignore when translating. Useful for specifing other widgets or third-party sections
   * where adding the ".skipTranslate" class is impractical.
   *
   * Example:
   *  Ignore Google Place Autocomplete popovers
   *  ['pac-container', 'pac-logo']
   */
  ignoreClasses: string[];
  /**
   * Selectors to ignore when translating. Useful for specifing other widgets or third-party sections
   * where adding the ".skipTranslate" class is impractical.
   *
   * uses Element.matches() on candidate nodes
   * see: https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
   */
  ignoreSelectors: string[];
  /**
   * Should the "lang" attribute of the <html> element be updated as languages are changed?
   * This can have adverse effects on other tools which rely on a specific value to be present.
   */
  updateDocumentLanguageAttribute: boolean;
  /**
   * Used for specifying message that appears when the help and info button are pressed.
   * Providing undefined disables and hides the button.
   */
  /**
   * Defaults to:
   *  ['title', 'placeholder', 'alt']
   */
  includedAttributes: string[];
}
