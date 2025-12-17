---
title: Rate Limits
description: Understanding API rate limits and quotas
---

# Rate Limits

To ensure fair usage and system stability, the Orbis API implements rate limiting.

## Limits

| Scope | Limit | Window |
| :--- | :--- | :--- |
| **Per API Key** | 100 requests | 1 hour |

## Headers

All API responses include headers to help you track your usage:

- `X-RateLimit-Limit`: The maximum number of requests allowed in the current window.
- `X-RateLimit-Remaining`: The number of requests remaining in the current window.
- `X-RateLimit-Reset`: The time at which the current window resets (in UTC epoch seconds).

## Exceeding Limits

If you exceed the rate limit, the API will return a `429 Too Many Requests` response.

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## Best Practices

- **Cache responses**: Store data locally to reduce the number of API calls.
- **Use conditional requests**: Use ETags to avoid downloading unchanged data.
- **Implement backoff**: If you hit a rate limit, wait before retrying.
