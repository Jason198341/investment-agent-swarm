import FinanceDataReader as fdr
from datetime import datetime, timedelta
from services.cache import cache
from models.stock import OHLCVItem, StockInfo, StockDataResponse, FundamentalsResponse

OHLCV_TTL = 300         # 5 min
INFO_TTL = 3600          # 1 hour

PERIOD_MAP = {
    "1mo": 30,
    "3mo": 90,
    "6mo": 180,
    "1y": 365,
    "2y": 730,
    "5y": 1825,
}


def _get_kr_listing():
    """Get KRX stock listing with caching."""
    cache_key = "kr_listing"
    cached = cache.get(cache_key)
    if cached:
        return cached
    listing = fdr.StockListing("KRX")
    cache.set(cache_key, listing, 86400)  # 24h
    return listing


def get_kr_stock(ticker: str, period: str = "6mo") -> StockDataResponse:
    cache_key = f"kr_stock:{ticker}:{period}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    days = PERIOD_MAP.get(period, 180)
    start = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    df = fdr.DataReader(ticker, start)

    if df.empty:
        raise ValueError(f"No data found for KR ticker: {ticker}")

    ohlcv = []
    for date, row in df.iterrows():
        ohlcv.append(OHLCVItem(
            date=date.strftime("%Y-%m-%d"),
            open=round(float(row["Open"]), 0),
            high=round(float(row["High"]), 0),
            low=round(float(row["Low"]), 0),
            close=round(float(row["Close"]), 0),
            volume=int(row["Volume"]),
        ))

    # Try to find name from listing
    name = ticker
    try:
        listing = _get_kr_listing()
        match = listing[listing["Code"] == ticker]
        if not match.empty:
            name = match.iloc[0]["Name"]
    except Exception:
        pass

    last = ohlcv[-1] if ohlcv else None
    prev = ohlcv[-2] if len(ohlcv) >= 2 else None
    current_price = last.close if last else 0
    change = round(current_price - (prev.close if prev else current_price), 0)
    change_pct = round((change / prev.close * 100) if prev and prev.close else 0, 2)

    result = StockDataResponse(
        info=StockInfo(
            ticker=ticker,
            name=name,
            market="kr",
            currency="KRW",
        ),
        ohlcv=ohlcv,
        currentPrice=current_price,
        change=change,
        changePercent=change_pct,
    )

    cache.set(cache_key, result, OHLCV_TTL)
    return result


def get_kr_fundamentals(ticker: str) -> FundamentalsResponse:
    cache_key = f"kr_fundamentals:{ticker}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    # FinanceDataReader doesn't provide fundamentals easily
    # Return minimal data; can be enriched later
    result = FundamentalsResponse(ticker=ticker)
    cache.set(cache_key, result, INFO_TTL)
    return result
