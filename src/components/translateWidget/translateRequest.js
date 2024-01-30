// import umiRequest, { extend } from "umi-request";
import { getEnv } from "@/utils/getEnv";
import { toast } from "sonner";

/**
 * 异常处理程序
 */
const errorHandler = async (error) => {
  const { response } = error || {};
  const { status, statusText } = response || {};

  return {
    code: -1,
    msg: status,
    messageHasShowed: true,
  };
};

/**
 * 配置request请求时的默认参数
 */
const translateRequest = extend({
  errorHandler, // 默认错误处理
  credentials: "include", // 默认请求是否带上cookie
});

export default translateRequest;

/**
 * 將配置的資料於請求送出前，進行資料預處理
 */
function preprocessData(target) {
  // 如果為字串，則使用 trim 規則去除前後空白
  if (typeof target === "string") {
    return target.trim();
  }

  // 如果為 Array
  if (Array.isArray(target)) {
    return target.map(preprocessData);
  }

  // 如果為純粹物件
  if (isPureObject(target)) {
    return Object.fromEntries(
      Object.entries(target).map(([key, value]) => [key, preprocessData(value)])
    );
  }

  // 其他狀況則不更動直接回傳
  return target;
}

/**
 * 針對 body 進行預處理
 */
function bodyPreprocessData(body) {
  // body 可能會使用 JSON 字串，因此需要對其進行處理
  if (typeof body === "string") {
    try {
      const data = JSON.parse(body);
      return JSON.stringify(preprocessData(data));
    } catch {}
  }
  return preprocessData(body);
}

/**
 * 判斷是否為純粹的 Object 不為經由特定 Class 產生的物件
 */
function isPureObject(target) {
  return (
    target !== null &&
    typeof target === "object" &&
    Object.getPrototypeOf(target).isPrototypeOf(Object)
  );
}
