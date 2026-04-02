type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);
  const windowStart = now - windowMs;

  if (!current) {
    buckets.set(key, { timestamps: [now] });
    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
      remaining: Math.max(0, limit - 1),
    };
  }

  current.timestamps = current.timestamps.filter((timestamp) => timestamp > windowStart);

  if (current.timestamps.length >= limit) {
    const oldest = current.timestamps[0];
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
      remaining: 0,
    };
  }

  current.timestamps.push(now);
  buckets.set(key, current);

  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((current.timestamps[0] + windowMs - now) / 1000)),
    remaining: Math.max(0, limit - current.timestamps.length),
  };
}