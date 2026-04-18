export type RequestPrimitive = boolean | number | string | null | undefined;
export interface RequestBody {
  [key: string]: RequestPrimitive | RequestBody | RequestArray;
}

export interface RequestArray extends Array<RequestPrimitive | RequestBody> {}

export type RequestValue = RequestPrimitive | RequestBody | RequestArray;

export const asRequestBody = (value: object | null | undefined): RequestBody => {
  if (!value || Array.isArray(value)) {
    return {};
  }

  return value as RequestBody;
};

export const asString = (value: RequestValue): string => (typeof value === "string" ? value : "");

export const asNullableString = (value: RequestValue): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue || null;
};

export const asNumber = (value: RequestValue): number | undefined => {
  if (typeof value === "number") {
    return Number.isNaN(value) ? undefined : value;
  }

  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

export const asRequiredNumber = (value: RequestValue): number => {
  const parsedValue = asNumber(value);
  return parsedValue ?? Number.NaN;
};

export const asBoolean = (value: RequestValue): boolean => value === true;
