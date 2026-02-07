import time
from collections import defaultdict


class RateLimiter:
    """Simple per-key rate limiter."""

    def __init__(self, max_calls: int, period_seconds: float):
        self.max_calls = max_calls
        self.period = period_seconds
        self._calls: dict[str, list[float]] = defaultdict(list)

    def allow(self, key: str = "default") -> bool:
        now = time.time()
        calls = self._calls[key]
        # Remove expired
        self._calls[key] = [t for t in calls if now - t < self.period]
        if len(self._calls[key]) >= self.max_calls:
            return False
        self._calls[key].append(now)
        return True

    def wait_time(self, key: str = "default") -> float:
        if self.allow(key):
            return 0.0
        oldest = min(self._calls[key])
        return max(0.0, self.period - (time.time() - oldest))


# 60 calls per minute for yfinance
yfinance_limiter = RateLimiter(max_calls=60, period_seconds=60)
# 5 calls per minute for BOK API
bok_limiter = RateLimiter(max_calls=5, period_seconds=60)
