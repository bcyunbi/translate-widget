import { Dispatch, SetStateAction } from 'react';
import { DEFAULT_LANGUAGE_CODE } from './models';

export default class LanguageCodeHandler {
  static subscribers: Dispatch<SetStateAction<string>>[] = [];
  static subscriberLoadings: Dispatch<SetStateAction<boolean>>[] = [];
  static languageCode = DEFAULT_LANGUAGE_CODE;
  static firstEntered = true;
  static loading = false;
  static titleMap = new Map();

  static subscribeLoading(subscriber: Dispatch<SetStateAction<boolean>>) {
    this.subscriberLoadings.push(subscriber);
  }

  static publishLoading(loading: boolean) {
    this.subscriberLoadings.forEach(subscriber => subscriber(loading));
  }

  static setLoading(loading: boolean) {
    this.loading = loading;
    this.publishLoading(loading);
  }

  static hasFirstEntered() {
    this.firstEntered = false;
  }

  static setLanguageCode(code: string) {
    this.languageCode = code;
  }

  static subscribe(subscriber: Dispatch<SetStateAction<string>>) {
    this.subscribers.push(subscriber);
  }

  static publish(code: string) {
    this.subscribers.forEach(subscriber => subscriber(code));
  }

  static changeLanguage(code: string) {
    this.setLanguageCode(code);
    this.publish(code);
  }

  static updateTitleMap({
    url,
    translations,
  }: {
    url: string;
    translations: { en: string; zh: string };
  }) {
    this.titleMap.set(url, translations);
  }

  static getTitleMap(url: string) {
    return this.titleMap.get(url);
  }
}
