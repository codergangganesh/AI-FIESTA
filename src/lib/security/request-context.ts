import type { NextRequest } from "next/server";

export function getRequestContext(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  return {
    ipAddress,
    userAgent,
  };
}