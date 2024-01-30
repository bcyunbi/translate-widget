import React, { useEffect } from "react";
import { initTranslateWidget } from "./utils";

export const TranslateWidget = () => {
  useEffect(() => {
    console.log("initTranslateWidget");
    initTranslateWidget();
  }, []);

  return <></>;
};
