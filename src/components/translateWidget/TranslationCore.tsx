import React from "react";
import { useObserver } from "./useObserver";
import { DEFAULT_LANGUAGE_CODE, DropdownOptions } from "./models";

export let startTranslate = (lang: string) => {
  console.log("---start Translate---", lang);
};
export let resetTranslate = () => {
  console.log("---reset---");
};

export let languageCode = DEFAULT_LANGUAGE_CODE;

export function TranslationCore(props: { options: DropdownOptions }) {
  const { options } = props;
  const { handleChange, handleReset, language } = useObserver(options);
  languageCode = language;
  startTranslate = handleChange;
  resetTranslate = handleReset;
  return <></>;
}

export default TranslationCore;
