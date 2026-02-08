from fastapi import APIRouter
from datetime import datetime
from services.cache import cache
from services.us_stocks import _session, _fetch_chart
from services.indicators import compute_indicators
from services.us_stocks import get_us_stock
from services.kr_stocks import get_kr_stock
from services.bok_exchange import get_usd_krw
from models.stock import MarketOverviewResponse, IndicatorValue

router = APIRouter(prefix="/api/market", tags=["market"])


def _index(ticker: str) -> dict:
    """Fetch index value via direct Yahoo Finance API."""
    try:
        chart = _fetch_chart(ticker, "5d")
        closes = chart.get("indicators", {}).get("quote", [{}])[0].get("close", [])
        # Filter None values
        valid = [c for c in closes if c is not None]
        if not valid:
            return {"value": 0, "change": 0}
        last = round(valid[-1], 2)
        prev = round(valid[-2], 2) if len(valid) >= 2 else last
        return {"value": last, "change": round(last - prev, 2)}
    except Exception:
        return {"value": 0, "change": 0}


@router.get("/overview", response_model=MarketOverviewResponse)
def market_overview():
    cache_key = "market_overview"
    cached = cache.get(cache_key)
    if cached:
        return cached

    sp500 = _index("^GSPC")
    nasdaq = _index("^IXIC")
    kospi = _index("^KS11")
    kosdaq = _index("^KQ11")
    vix_data = _index("^VIX")

    try:
        fx = get_usd_krw()
        usd_krw = fx.usdKrw
    except Exception:
        usd_krw = 0

    result = MarketOverviewResponse(
        sp500=sp500,
        nasdaq=nasdaq,
        kospi=kospi,
        kosdaq=kosdaq,
        vix=vix_data["value"],
        usdKrw=usd_krw,
        updatedAt=datetime.now().isoformat(),
    )
    cache.set(cache_key, result, 300)  # 5 min
    return result


@router.get("/indicators/{market}/{ticker}", response_model=IndicatorValue)
def indicators(market: str, ticker: str):
    cache_key = f"indicators:{market}:{ticker}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    if market == "us":
        data = get_us_stock(ticker.upper(), "1y")
    else:
        data = get_kr_stock(ticker, "1y")

    closes = [item.close for item in data.ohlcv]
    result = compute_indicators(closes)
    cache.set(cache_key, result, 300)
    return result
