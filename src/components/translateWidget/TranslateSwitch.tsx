import React, { useState } from "react";

import { ELangs, ETranslateToLanguage } from "@/enums/langs";
import { Switch } from "@/components/ui/switch";
import LanguageCodeHandler from "./languageCodeHandler";
import { DEFAULT_LANGUAGE_CODE } from "./models";
import { startTranslate } from "./TranslationCore";

export default function TranslateSwitch() {
  const [langVal, setLangVal] = useState(LanguageCodeHandler.languageCode);
  const [loading, setLoading] = useState(LanguageCodeHandler.loading);
  LanguageCodeHandler.subscribe(setLangVal);
  LanguageCodeHandler.subscribeLoading(setLoading);
  return (
    <div className="skipTranslate">
      <Switch
        checked={langVal === ETranslateToLanguage[ELangs.enUS]}
        onCheckedChange={(value) => {
          const lang = value
            ? ETranslateToLanguage[ELangs.enUS]
            : DEFAULT_LANGUAGE_CODE;
          startTranslate(lang);
        }}
      />
    </div>
  );
}
