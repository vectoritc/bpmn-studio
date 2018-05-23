import {IErrorResponse} from '../contracts/index';

export function isErrorResult(result: any | IErrorResponse): result is IErrorResponse {
  return result.error !== undefined;
}

export async function throwOnErrorResponse<TResult = any>(response: Response | any): Promise<TResult> {
  let result: TResult | IErrorResponse;

  if (response.id === undefined && typeof response.json === 'function') {
    result = await response.json();
  } else {
    result = response;
  }

  if (isErrorResult(result)) {
    throw new Error(result.error);
  }

  return result;
}
