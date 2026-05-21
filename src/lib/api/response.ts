import { NextResponse } from "next/server";

export type ApiResult<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResult<T>>({ data, error: null, status }, { status });
}

export function fail(error: string, status = 400, extra?: Record<string, string>) {
  return NextResponse.json({ data: null, error, status, ...extra }, { status });
}

export function serverError() {
  return fail("server_error", 500);
}
