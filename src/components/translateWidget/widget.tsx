import React from "react";
import ReactDOM from "react-dom";
import { TranslationCore } from "./TranslationCore";
import { extract } from "./utils";
import { DEFAULT_LANGUAGE_CODE, DropdownOptions } from "./models";

export function initHook(args: any, mountLocation: string = "TranslatorCore") {
  console.log("initHook");
  if (typeof args !== "object" && args !== null) args = {};
  // Re-compose options with type safety checks and default values
  const options: DropdownOptions = {
    pageLanguage: extract(args, "pageLanguage", DEFAULT_LANGUAGE_CODE),
    chunkSize: extract(args, "chunkSize", 10),
    preferredSupportedLanguages: extract(
      args,
      "preferredSupportedLanguages",
      []
    ),
    intersectionThreshold: extract(args, "intersectionThreshold", 0.0),
    ignoreIntersection: extract(args, "ignoreIntersection", false),
    ignoreClasses: extract(args, "ignoreClasses", []),
    ignoreSelectors: extract(args, "ignoreSelectors", []),
    updateDocumentLanguageAttribute: extract(
      args,
      "updateDocumentLanguageAttribute",
      false
    ),
    includedAttributes: extract(args, "includedAttributes", ["placeholder"]),
  };
  const targetElement = document.getElementById(mountLocation);
  if (targetElement) {
    ReactDOM.render(<TranslationCore options={options} />, targetElement);
  }
}
