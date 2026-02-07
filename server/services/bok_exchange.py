import httpx
import yfinance as yf
from datetime import datetime
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

    # Fallback: yfinance
    result = _fetch_from_yfinance()
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


def _fetch_from_yfinance() -> ExchangeRateResponse:
    """Fallback: fetch USD/KRW from yfinance."""
    tk = yf.Ticker("KRW=X")
    hist = tk.history(period="5d")
    if hist.empty:
        raise ValueError("Cannot fetch exchange rate")
    rate = round(float(hist["Close"].iloc[-1]), 2)
    return ExchangeRateResponse(
        usdKrw=rate,
        updatedAt=datetime.now().isoformat(),
        source="yfinance",
    )
