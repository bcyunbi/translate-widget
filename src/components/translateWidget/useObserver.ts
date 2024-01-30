import { useEffect, useRef, useState } from "react";
import {
  CustomTreeWalker,
  getNearestVisibleAncestor,
} from "./customTreeWalker";
import { useMutationObserver } from "rooks";
import {
  chunkedArray,
  containsChinese,
  existsInside,
  translate,
  updateDocumentTitle,
} from "./utils";

import {
  DEFAULT_LANGUAGE_CODE,
  DropdownOptions,
  TranslatedNode,
  TranslatedTextMap,
  TranslationStatus,
  TranslationStatusMap,
  mountLocationId,
  translateLanguageCodeKey,
} from "./models";
import LanguageCodeHandler from "./languageCodeHandler";
import { unmountComponentAtNode } from "react-dom";

export function useObserver(options: DropdownOptions) {
  const [customTreeWalker, _] = useState(new CustomTreeWalker(options));
  const [translatedNodes, setTranslatedNodes] = useState<TranslatedNode[]>([]);
  const bodyRef = useRef(document.body);
  const htmlRef = useRef(document.querySelector("html"));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE_CODE);

  useEffect(() => {
    LanguageCodeHandler.subscribe(setLanguage);
  }, []);

  /**
   * Here, the results from our IntersectionObserver are merged with our existing dataset
   */
  const handleElementIntersection = (entries: IntersectionObserverEntry[]) => {
    const entriesMap = new Map(
      entries.map((entry) => {
        let isIntersecting = entry.isIntersecting;

        const parentElement = entry.target.parentElement;
        // isSonnerChildren: handel data-sonner-toast issue
        const isSonnerChildren =
          parentElement?.getAttribute("data-sonner-toast") !== null ||
          parentElement.parentElement?.getAttribute("data-sonner-toast") !==
            null;
        if (!entry.isIntersecting && parentElement) {
          if (parentElement?.style.position === "fixed" || isSonnerChildren)
            isIntersecting = true;
        }
        return [entry.target, isIntersecting];
      })
    );
    setTranslatedNodes((previous) => {
      const result = previous.slice();
      // for all items
      for (let item of result) {
        if (item.nearestVisibleAncestor) {
          // if we find a matching pair
          const isIntersecting = entriesMap.get(item.nearestVisibleAncestor);
          if (isIntersecting) {
            item.isIntersecting = isIntersecting;
          }
        }
      }
      return result;
    });
  };

  /**
   * Used for determining if an element is visible in the viewport or not before translating it
   * See: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
   */
  const intersectionObserver = useRef(
    new IntersectionObserver(handleElementIntersection, {
      // https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#parameters
      root: document.body,
      // rootMargin?: string;
      threshold: options.intersectionThreshold,
    })
  );

  /**
   * Whenever changes are made to the DOM, adjust translatedNodes accordingly
   * This includes:
   * - Whenever an element is added or removed
   * - Whenever an element's text changes
   */
  const handleDocumentMutation: MutationCallback = (mutations) => {
    // wrap in this so we don't have race conditions
    setTranslatedNodes((previous) => {
      const result = previous.slice();
      for (let mutation of mutations) {
        // If an element is added or removed
        if (mutation.type === "childList") {
          // Add the added nodes to translatedNodes
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            // use this as a shorthand
            const node = mutation.addedNodes[i];
            // check if this is a Node we even want, reusing our custom filter
            if (
              customTreeWalker.customFilter.acceptNode(node) ===
              NodeFilter.FILTER_ACCEPT
            ) {
              // make sure this node isn't one we're already watching
              if (node.nodeType === Node.TEXT_NODE) {
                if (
                  !existsInside(
                    result,
                    (e) => e.node.isSameNode(node) && e.attribute === "_text_"
                  )
                ) {
                  const originalText = node.nodeValue ?? "";
                  if (originalText !== "") {
                    const nativeStatus: TranslationStatusMap = {};
                    nativeStatus[options.pageLanguage] =
                      TranslationStatus.Translated;

                    const ancestor = getNearestVisibleAncestor(node);

                    // add to intersection observer
                    if (ancestor)
                      intersectionObserver.current.observe(ancestor);
                    result.push({
                      originalText: originalText,
                      currentLanguage: options.pageLanguage,
                      translatedText: {},
                      translationStatus: nativeStatus,
                      node,
                      isIntersecting: false,
                      nearestVisibleAncestor: ancestor,
                      attribute: "_text_",
                    });
                  }
                }
              } else if (
                node instanceof HTMLElement &&
                options.includedAttributes.length > 0
              ) {
                for (let attrName of options.includedAttributes) {
                  if (node.hasAttribute(attrName)) {
                    if (
                      !existsInside(
                        result,
                        (e) =>
                          e.node.isSameNode(node) && e.attribute === attrName
                      )
                    ) {
                      const originalText = node.getAttribute(attrName) ?? "";
                      if (originalText !== "") {
                        const nativeStatus: TranslationStatusMap = {};
                        nativeStatus[options.pageLanguage] =
                          TranslationStatus.Translated;

                        const ancestor = node;

                        // add to intersection observer
                        if (ancestor)
                          intersectionObserver.current.observe(ancestor);
                        result.push({
                          originalText: originalText,
                          currentLanguage: options.pageLanguage,
                          translatedText: {},
                          translationStatus: nativeStatus,
                          node,
                          isIntersecting: false,
                          nearestVisibleAncestor: ancestor,
                          attribute: attrName,
                        });
                      }
                    }
                  }
                }
              }
            }
            // if this is not a Node that we want, maybe it's children are
            else {
              const children = customTreeWalker.textNodesUnder(node);
              for (let child of children) {
                // make sure this node isn't one we're already watching
                if (child.nodeType === Node.TEXT_NODE) {
                  if (
                    !existsInside(
                      result,
                      (e) =>
                        e.node.isSameNode(child) && e.attribute === "_text_"
                    )
                  ) {
                    const originalText = child.nodeValue ?? "";

                    if (originalText !== "") {
                      const nativeStatus: TranslationStatusMap = {};
                      nativeStatus[options.pageLanguage] =
                        TranslationStatus.Translated;

                      const ancestor = getNearestVisibleAncestor(child);

                      // add to intersection observer
                      if (ancestor)
                        intersectionObserver.current.observe(ancestor);
                      result.push({
                        originalText: originalText,
                        currentLanguage: options.pageLanguage,
                        translatedText: {
                          [options.pageLanguage]: originalText,
                        },
                        translationStatus: nativeStatus,
                        node: child,
                        isIntersecting: false,
                        nearestVisibleAncestor: ancestor,
                        attribute: "_text_",
                      });
                    }
                  }
                } else if (
                  child instanceof HTMLElement &&
                  options.includedAttributes.length > 0
                ) {
                  for (let attrName of options.includedAttributes) {
                    if (child.hasAttribute(attrName)) {
                      if (
                        !existsInside(
                          result,
                          (e) =>
                            e.node.isSameNode(child) && e.attribute === attrName
                        )
                      ) {
                        const originalText = child.getAttribute(attrName) ?? "";
                        if (originalText !== "") {
                          const nativeStatus: TranslationStatusMap = {};
                          nativeStatus[options.pageLanguage] =
                            TranslationStatus.Translated;

                          const ancestor = child;

                          // add to intersection observer
                          if (ancestor)
                            intersectionObserver.current.observe(ancestor);
                          result.push({
                            originalText: originalText,
                            currentLanguage: options.pageLanguage,
                            translatedText: {
                              [options.pageLanguage]: originalText,
                            },
                            translationStatus: nativeStatus,
                            node: child,
                            isIntersecting: false,
                            nearestVisibleAncestor: ancestor,
                            attribute: attrName,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          // Remove the removed nodes from translatedNodes
          for (let i = 0; i < mutation.removedNodes.length; i++) {
            // use this as a shorthand
            const node = mutation.removedNodes[i];
            // check if this is a Node we are monitoring, reusing our custom filter
            // TODO: similar to above, make sure this only affects text/"nodeValue" nodes
            if (
              customTreeWalker.customFilter.acceptNode(node) ===
              NodeFilter.FILTER_ACCEPT
            ) {
              // find the index of this node in translatedNodes
              if (node.nodeType === Node.TEXT_NODE) {
                const index = result.findIndex(
                  (e) => e.node.isSameNode(node) && e.attribute === "_text_"
                );
                if (index >= 0) {
                  if (result[index].nearestVisibleAncestor)
                    intersectionObserver.current.unobserve(
                      result[index].nearestVisibleAncestor!
                    );
                  // remove it
                  result.splice(index, 1);
                }
              } else if (
                node instanceof HTMLElement &&
                options.includedAttributes.length > 0
              ) {
                for (let attrName of options.includedAttributes) {
                  const index = result.findIndex(
                    (e) => e.node.isSameNode(node) && e.attribute === attrName
                  );
                  if (index >= 0) {
                    if (result[index].nearestVisibleAncestor)
                      intersectionObserver.current.unobserve(
                        result[index].nearestVisibleAncestor!
                      );
                    // remove it
                    result.splice(index, 1);
                  }
                }
              }
            }
            // if this is not a Node that we want, maybe it's children are
            else {
              const children = customTreeWalker.textNodesUnder(node);
              for (let child of children) {
                if (child.nodeType === Node.TEXT_NODE) {
                  const index = result.findIndex(
                    (e) => e.node.isSameNode(child) && e.attribute === "_text_"
                  );
                  if (index >= 0) {
                    if (result[index].nearestVisibleAncestor)
                      intersectionObserver.current.unobserve(
                        result[index].nearestVisibleAncestor!
                      );
                    // remove it
                    result.splice(index, 1);
                  }
                } else if (
                  child instanceof HTMLElement &&
                  options.includedAttributes.length > 0
                ) {
                  for (let attrName of options.includedAttributes) {
                    const index = result.findIndex(
                      (e) =>
                        e.node.isSameNode(child) && e.attribute === attrName
                    );
                    if (index >= 0) {
                      if (result[index].nearestVisibleAncestor)
                        intersectionObserver.current.unobserve(
                          result[index].nearestVisibleAncestor!
                        );
                      // remove it
                      result.splice(index, 1);
                    }
                  }
                }
              }
            }
          }
        }
        // If the text of an element changed
        /**
         * TODO:
         * - mutation type 'characterData' ONLY affects text/"nodeValue" nodes!
         * - take action accordingly
         */
        if (mutation.type === "characterData") {
          // find the index of this node in translatedNodes
          const index = result.findIndex(
            (e) =>
              e.node.isSameNode(mutation.target) && e.attribute === "_text_"
          );
          // check if this is a node we're watching
          if (index >= 0) {
            // check if the mutation was NOT as a result of translating, and instead was updated by some other factor
            if (
              (!result[index].translationStatus[language] ||
                result[index].translationStatus[language] ===
                  TranslationStatus.Translated) &&
              result[index].translatedText[language] !==
                mutation.target.nodeValue
            ) {
              // this mutation is one that we didnt make, so we have to update the state so it will be translated in the Effect hook

              // Update information about all languages we've translated to
              // Setting these values will cause the Effect hook to pick up on it
              // clear out old translation data
              for (let key in result[index].translatedText) {
                result[index].translatedText[key] = undefined;
                result[index].translationStatus[key] =
                  TranslationStatus.NotTranslated;
              }

              // Update information about the page's native language
              result[index].originalText = mutation.target.nodeValue ?? "";
              result[index].translatedText[options.pageLanguage] =
                result[index].originalText;
              result[index].translationStatus[options.pageLanguage] =
                TranslationStatus.Translated;
              result[index].currentLanguage = options.pageLanguage;
            } else {
              // this mutation is one that we probably caused, so we don't want to translate it again
              //console.log('this mutation was probably us')
            }
          }
        }
        if (mutation.type === "attributes") {
          const index = result.findIndex(
            (e) =>
              e.node.isSameNode(mutation.target) &&
              options.includedAttributes.includes(e.attribute)
          );
          if (index >= 0 && mutation.target instanceof HTMLElement) {
            const currentNodeValues = mutation.target.getAttribute(
              result[index].attribute
            );
            if (
              (!result[index].translationStatus[language] ||
                result[index].translationStatus[language] ===
                  TranslationStatus.Translated) &&
              result[index].translatedText[language] !== currentNodeValues
            ) {
              for (let attrName of options.includedAttributes) {
                const originalText =
                  mutation.target.getAttribute(attrName) ?? "";
                result[index].originalText = originalText;
                result[index].translatedText[options.pageLanguage] =
                  result[index].originalText;
                result[index].translationStatus[options.pageLanguage] =
                  TranslationStatus.Translated;
                result[index].currentLanguage = options.pageLanguage;
              }
            }
          }
        }
      }
      return result;
    });
  };

  /**
   * Watch the DOM for changes
   * See:
   * - https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
   * - https://www.npmjs.com/package/@rooks/use-mutation-observer
   */
  useMutationObserver(bodyRef, handleDocumentMutation);

  useEffect(() => {
    if (language !== "" && options.pageLanguage !== language) {
      if (options.updateDocumentLanguageAttribute)
        htmlRef.current?.setAttribute(
          "lang",
          `${language}-translate-from-${options.pageLanguage}`
        );
    } else {
      if (options.updateDocumentLanguageAttribute)
        htmlRef.current?.setAttribute("lang", options.pageLanguage);
    }
  }, [language]);
  /**
   * Initialize translatedNodes and repopulate translations if they are missing
   * This pairs with handleDocumentMutation
   */
  useEffect(() => {
    // if translatedNodes is not initialized, initialize it
    if (translatedNodes.length === 0) {
      // get all leaf text nodes
      const nodes = customTreeWalker.textNodesUnder(document.body);
      for (let node of nodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          const originalText = node.nodeValue ?? "";

          if (originalText !== "") {
            const nativeLang: TranslatedTextMap = {};
            nativeLang[options.pageLanguage] = originalText;
            const nativeStatus: TranslationStatusMap = {};
            nativeStatus[options.pageLanguage] = TranslationStatus.Translated;

            const ancestor = getNearestVisibleAncestor(node);

            // add to intersection observer
            if (ancestor) intersectionObserver.current.observe(ancestor);

            setTranslatedNodes((prevList) => [
              ...prevList,
              {
                originalText: originalText,
                currentLanguage: options.pageLanguage,
                translatedText: nativeLang,
                translationStatus: nativeStatus,
                node,
                isIntersecting: false,
                nearestVisibleAncestor: ancestor,
                attribute: "_text_",
              },
            ]);
          }
        }
        if (node instanceof HTMLElement) {
          for (let attrName of options.includedAttributes) {
            const originalText = node.getAttribute(attrName) ?? "";
            if (originalText !== "") {
              const nativeLang: TranslatedTextMap = {};
              nativeLang[options.pageLanguage] = originalText;
              const nativeStatus: TranslationStatusMap = {};
              nativeStatus[options.pageLanguage] = TranslationStatus.Translated;
              const ancestor = node;

              // add to intersection observer
              if (ancestor) intersectionObserver.current.observe(ancestor);

              setTranslatedNodes((prevList) => [
                ...prevList,
                {
                  originalText: originalText,
                  currentLanguage: options.pageLanguage,
                  translatedText: nativeLang,
                  translationStatus: nativeStatus,
                  node,
                  isIntersecting: false,
                  nearestVisibleAncestor: ancestor,
                  attribute: attrName,
                },
              ]);
            }
          }
        }
      }
    }
    // if translatedNodes is already initialized
    else {
      // check that the language isn't set to the "Select Language" dropdown
      if (language !== "") {
        (async () => {
          // filter translatedNodes to get a list of nodes that aren't translated to the current language, AND that are visible in the viewport currently
          const needsTranslating = translatedNodes.filter(
            (e) =>
              e.translatedText[language] === undefined &&
              (e.translationStatus[language] === undefined ||
                e.translationStatus[language] ===
                  TranslationStatus.NotTranslated) &&
              (options.ignoreIntersection === true || e.isIntersecting === true)
          );
          if (needsTranslating.length > 0) {
            // we're about to do a bunch of stuff, let's put up a loading spinner
            setIsLoading(true);
            // mark these nodes as "in progress", so our chunked changes don't issue duplicate requests
            setTranslatedNodes((previous) => {
              const results = previous.slice();
              for (let i = 0; i < needsTranslating.length; i++) {
                for (let j = 0; j < results.length; j++) {
                  if (needsTranslating[i].node.isSameNode(results[j].node)) {
                    results[j].translationStatus[language] =
                      TranslationStatus.InProgress;
                  }
                }
              }
              return results;
            });

            // fetch and apply translations
            for (let chunk of chunkedArray(
              needsTranslating,
              options.chunkSize
            ) as TranslatedNode[][]) {
              const needTranslateNode: number[] = [];

              const text = chunk.map((e, index) => {
                if (containsChinese(e.originalText))
                  needTranslateNode.push(index);
                return e.originalText;
              });

              const apiText = text.filter((originalText, index) =>
                needTranslateNode.includes(index)
              );
              const data = await translate(
                apiText,
                options.pageLanguage,
                language
              );

              setTranslatedNodes((previous) => {
                const results = previous.slice();
                for (let i = 0; i < chunk.length; i++) {
                  // find where this chunk's node exists in the state
                  const index = results.findIndex(
                    (e) =>
                      e.node.isSameNode(chunk[i].node) &&
                      e.attribute === chunk[i].attribute
                  );
                  // if we could find it, update the state
                  if (index >= 0) {
                    if (needTranslateNode.includes(i)) {
                      const dataIndex = apiText.indexOf(text[i]);
                      results[index].translatedText[language] =
                        dataIndex >= 0 ? data[dataIndex] : text[i];
                    } else results[index].translatedText[language] = text[i];

                    results[index].translationStatus[language] =
                      TranslationStatus.Translated;
                    /**
                     * intentionally don't update the DOM here so we can update the DOM on the next effect call
                     * that will happen as a result of our state changes here
                     */
                    //previous[index].node.nodeValue = previous[index].translatedText[language] ?? '';
                  }
                }
                return results;
              });
            }
          }
        })();

        // update the DOM with whatever is stored in the state
        // check if any of the "currentLanguage" is different from the dropdown setting
        if (
          translatedNodes.some(
            (e: {
              currentLanguage: string;
              translatedText: { [x: string]: string | undefined };
              isIntersecting: boolean;
            }) =>
              e.currentLanguage !== language &&
              e.translatedText[language] !== undefined &&
              (options.ignoreIntersection === true || e.isIntersecting === true)
          )
        ) {
          setTranslatedNodes((previous) => {
            const results = previous.slice();
            // update "currentLanguage" field and update DOM
            for (let i = 0; i < results.length; i++) {
              // if "currentLanguage" is different from the dropdown setting
              if (
                results[i].currentLanguage !== language &&
                results[i].translatedText[language] !== undefined
              ) {
                results[i].currentLanguage = language;
                if (results[i].attribute === "_text_") {
                  results[i].node.nodeValue =
                    results[i].translatedText[language] ?? ""; // TODO: do something different depending on type
                  const nearestVisibleAncestor =
                    results[i].nearestVisibleAncestor;
                  if (nearestVisibleAncestor !== null) {
                    nearestVisibleAncestor.dataset.targetLang =
                      language ?? "zh";
                  }
                } else {
                  let node = results[i].node;
                  if (node instanceof Element) {
                    let attr = results[i].attribute;
                    let translatedText =
                      results[i].translatedText[language] ?? "";
                    node.setAttribute(attr, translatedText);
                  }
                }
              }
            }
            return results;
          });
        }

        if (
          translatedNodes.some(
            (e) =>
              e.translationStatus[language] === TranslationStatus.InProgress
          )
        ) {
          setIsLoading(true);
        } else {
          setIsLoading(false);
        }
      }
    }
  }, [language, translatedNodes]);

  // whenever a new language option is selected
  const handleChange = async (languageCode: string) => {
    LanguageCodeHandler.changeLanguage(languageCode);
    localStorage.setItem(translateLanguageCodeKey, languageCode);
    await updateDocumentTitle(languageCode);
  };

  /**
   * Reset TranslatedNodes & remove mountLocation
   */
  const handleReset = async () => {
    const mountLocation = document.getElementById(mountLocationId);
    if (mountLocation) {
      unmountComponentAtNode(mountLocation);
      mountLocation.remove();
      LanguageCodeHandler.changeLanguage(DEFAULT_LANGUAGE_CODE);
    }
    setTranslatedNodes((previous) => {
      return [];
    });
  };

  /**
   * What happens when the Banner's exit button is clicked
   */
  const handleExit = async () => {
    LanguageCodeHandler.changeLanguage(options.pageLanguage);
    await updateDocumentTitle(options.pageLanguage);
  };

  return { handleChange, handleExit, handleReset, language, isLoading };
}
