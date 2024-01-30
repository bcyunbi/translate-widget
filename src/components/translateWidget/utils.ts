// import translateRequest from "@/utils/translateRequest";
import { DEFAULT_LANGUAGE_CODE, mountLocationId } from "./models";
import LanguageCodeHandler from "./languageCodeHandler";
import { ELangs, ETranslateToLanguage } from "@/enums/langs";
// import { CUSTOMERSERVER } from "@/services/api";
import { initHook } from "./widget";
// import i18next from "i18next";
import { toast } from "sonner";

/**
 * From: https://dev.to/jorik/country-code-to-flag-emoji-a21
 */
export function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * From: https://stackoverflow.com/a/37826698
 */
export function chunkedArray<T>(inputArray: T[], perChunk: number): T[][] {
  var result = inputArray.reduce<T[][]>((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  return result;
}

/**
 * Extract the value from an object by a key (or nested keys), and return a default value if that value is missing
 */
export function extract(
  obj: { [key: string]: any },
  key: string | string[],
  defaultValue: any
): any {
  if (Array.isArray(key)) {
    if (key.length === 0) {
      throw `This shouldn't happen`;
    }
    if (key.length === 1) {
      // Extract this only key left
      return extract(obj, key[0], defaultValue);
    } else if (key.length > 1) {
      // If current key doesn't exist, return defaultValue
      if (obj[key[0]] === undefined) {
        return defaultValue;
      } else {
        // Otherwise, recurse to next key
        return extract(obj[key[0]], key.slice(1), defaultValue);
      }
    }
  } else {
    // If value is nullish, return defaultValue instead
    return obj[key] === undefined || obj[key] === null
      ? defaultValue
      : obj[key];
  }
}

export function existsInside<T>(
  array: T[],
  predicate: (value: T, index: number, obj: T[]) => unknown
) {
  return array.findIndex(predicate) >= 0;
}

const requestErrorMap = new Map();

export async function translate(
  text: string[],
  from: string = DEFAULT_LANGUAGE_CODE,
  to: string
): Promise<string[]> {
  if (text.length < 1) return [];
  return text.map((word) => word + "翻譯");
  try {
    const res = await translateRequest(
      `${BASE_API}${CUSTOMERSERVER}/translate?from=zh&to=${to}`,
      {
        method: "POST",
        data: text,
      }
    );
    if (res.code === 0) {
      const data = await res.data;
      if (Array.isArray(data) && data.every((e) => typeof e === "string")) {
        return data;
      } else {
        throw `Data returned from endpoint was not of type string[], data: ${JSON.stringify(
          data
        )}`;
      }
    } else {
      if (!res.messageHasShowed && !requestErrorMap.get(res.code)) {
        requestErrorMap.set(res.code, res.msg);
        toast(res.msg);
      }
    }
    return [];
  } catch (err) {
    throw err;
  }
}

export function containsChinese(text: string) {
  const regexOnlyWhitespace = /^[\s]*$/;
  const regexOnlyDigitsWhiteSpacePunctuation =
    /^[\d\s!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]*$/;
  const chinesePattern = /[\u4e00-\u9fa5]/;

  const isWhitespace = regexOnlyWhitespace.test(text ?? "");
  const isDigitsWhiteSpacePunctuation =
    regexOnlyDigitsWhiteSpacePunctuation.test(text ?? "");
  const hasChineseCharacters = chinesePattern.test(text);

  return (
    !isWhitespace && !isDigitsWhiteSpacePunctuation && hasChineseCharacters
  );
}

export async function updateDocumentTitle(
  lang: string = DEFAULT_LANGUAGE_CODE
) {
  const translatedTitle = (await getTitleTranslation(lang)) || "";
  document.title = translatedTitle;
}
export async function getTitleTranslation(
  lang: string = DEFAULT_LANGUAGE_CODE
) {
  const langVal = lang ? lang : DEFAULT_LANGUAGE_CODE;
  const titleTranslation = LanguageCodeHandler.getTitleMap(document.URL);
  let title = "";

  if (titleTranslation) {
    title = titleTranslation[langVal];
  } else {
    const translateTitle = await translate(
      [document.title],
      DEFAULT_LANGUAGE_CODE,
      ETranslateToLanguage[ELangs.enUS]
    );
    LanguageCodeHandler.updateTitleMap({
      url: document.URL,
      translations: {
        en: translateTitle[0] || "",
        zh: document.title,
      },
    });
    title =
      langVal === ETranslateToLanguage[ELangs.enUS]
        ? translateTitle[0]
        : document.title;
  }
  return title;
}

export async function initTranslateWidget() {
  const mountLocation = document.getElementById(mountLocationId);
  if (!mountLocation) {
    LanguageCodeHandler.setLoading(true);
    const element = document.createElement("div");
    element.setAttribute("id", mountLocationId);
    document.body.appendChild(element);
    setTimeout(() => {
      initHook(
        {
          pageLanguage: DEFAULT_LANGUAGE_CODE,
          chunkSize: 30,
          preferredSupportedLanguages: [DEFAULT_LANGUAGE_CODE, "en"],
          ignoreIntersection: false,
          ignoreSelectors: [],
          intersectionThreshold: 0,
          ignoreClasses: [],
          updateDocumentLanguageAttribute: true,
          includedAttributes: ["placeholder", "ol", "li", "innerText"],
        },
        mountLocationId
      );
      // i18next.changeLanguage(i18next.language);
      LanguageCodeHandler.setLoading(false);
    }, 1000);
  }
}
