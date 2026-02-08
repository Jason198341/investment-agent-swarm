"""Exchange rate service: BOK API primary, Yahoo Finance fallback."""
import httpx
from datetime import datetime, timezone
from services.cache import cache
from config import BOK_API_KEY
from models.stock import ExchangeRateResponse

EXCHANGE_TTL = 600  # 10 min


def get_usd_krw() -> ExchangeRateResponse:
    cache_key = "exchange:usd_krw"
    cached = cache.get(cache_key)
    if cached:
        return cached

    # Try BOK API first
    if BOK_API_KEY:
        try:
            result = _fetch_from_bok()
            cache.set(cache_key, result, EXCHANGE_TTL)
            return result
        except Exception:
            pass

    # Fallback: Yahoo Finance direct API
    result = _fetch_from_yahoo()
    cache.set(cache_key, result, EXCHANGE_TTL)
    return result


def _fetch_from_bok() -> ExchangeRateResponse:
    """Fetch USD/KRW from Bank of Korea API."""
    today = datetime.now().strftime("%Y%m%d")
    url = (
        f"https://ecos.bok.or.kr/api/StatisticSearch/{BOK_API_KEY}/json/kr/1/1/"
        f"731Y001/D/{today}/{today}/0000001"
    )
    resp = httpx.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    rows = data.get("StatisticSearch", {}).get("row", [])
    if not rows:
        raise ValueError("No BOK exchange data")

    rate = float(rows[0]["DATA_VALUE"])
    return ExchangeRateResponse(
        usdKrw=rate,
        updatedAt=datetime.now().isoformat(),
        source="bok",
    )


def _fetch_from_yahoo() -> ExchangeRateResponse:
    """Fallback: fetch USD/KRW from Yahoo Finance direct API."""
    from services.us_stocks import _session
    url = "https://query1.finance.yahoo.com/v8/finance/chart/KRW=X"
    params = {"range": "5d", "interval": "1d"}
    resp = _session.get(url, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    result = data.get("chart", {}).get("result")
    if not result:
        raise ValueError("Cannot fetch exchange rate")

    closes = result[0].get("indicators", {}).get("quote", [{}])[0].get("close", [])
    # Get last non-None close
    rate = None
    for c in reversed(closes):
        if c is not None:
            rate = round(c, 2)
            break

    if rate is None:
        raise ValueError("No exchange rate data")

    return ExchangeRateResponse(
        usdKrw=rate,
        updatedAt=datetime.now().isoformat(),
        source="yfinance",
    )
