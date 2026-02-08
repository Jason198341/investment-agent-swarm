"""US stock data via direct Yahoo Finance API (bypasses yfinance rate limiting)."""
import requests
from datetime import datetime, timezone
from services.cache import cache
from models.stock import OHLCVItem, StockInfo, StockDataResponse, FundamentalsResponse

# TTL constants (seconds)
OHLCV_INTRADAY_TTL = 300    # 5 min
OHLCV_DAILY_TTL = 3600      # 1 hour
FUNDAMENTALS_TTL = 3600      # 1 hour

_session = requests.Session()
_session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
})

PERIOD_MAP = {
    "1d": "1d", "5d": "5d", "1mo": "1mo", "3mo": "3mo",
    "6mo": "6mo", "1y": "1y", "2y": "2y", "5y": "5y",
}


def _fetch_chart(ticker: str, period: str = "6mo", interval: str = "1d") -> dict:
    """Fetch chart data from Yahoo Finance v8 API."""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    params = {"range": PERIOD_MAP.get(period, "6mo"), "interval": interval}
    resp = _session.get(url, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    result = data.get("chart", {}).get("result")
    if not result:
        raise ValueError(f"No data for {ticker}")
    return result[0]


def _fetch_quote_summary(ticker: str) -> dict:
    """Fetch quote summary (fundamentals, info) from Yahoo Finance."""
    url = f"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{ticker}"
    params = {"modules": "assetProfile,defaultKeyStatistics,financialData,summaryDetail,price"}
    try:
        resp = _session.get(url, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        result = data.get("quoteSummary", {}).get("result")
        return result[0] if result else {}
    except Exception:
        return {}


def get_us_stock(ticker: str, period: str = "6mo") -> StockDataResponse:
    cache_key = f"us_stock:{ticker}:{period}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    chart = _fetch_chart(ticker, period)
    meta = chart.get("meta", {})
    timestamps = chart.get("timestamp", [])
    quote = chart.get("indicators", {}).get("quote", [{}])[0]

    ohlcv = []
    opens = quote.get("open", [])
    highs = quote.get("high", [])
    lows = quote.get("low", [])
    closes = quote.get("close", [])
    volumes = quote.get("volume", [])

    for i, ts in enumerate(timestamps):
        o = opens[i] if i < len(opens) and opens[i] is not None else 0
        h = highs[i] if i < len(highs) and highs[i] is not None else 0
        l = lows[i] if i < len(lows) and lows[i] is not None else 0
        c = closes[i] if i < len(closes) and closes[i] is not None else 0
        v = volumes[i] if i < len(volumes) and volumes[i] is not None else 0

        if c == 0:
            continue  # skip invalid days

        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
        ohlcv.append(OHLCVItem(
            date=dt.strftime("%Y-%m-%d"),
            open=round(o, 2),
            high=round(h, 2),
            low=round(l, 2),
            close=round(c, 2),
            volume=int(v),
        ))

    if not ohlcv:
        raise ValueError(f"No OHLCV data for {ticker}")

    last = ohlcv[-1]
    prev = ohlcv[-2] if len(ohlcv) >= 2 else last
    change = round(last.close - prev.close, 2)
    change_pct = round((change / prev.close * 100) if prev.close else 0, 2)

    # Get name from meta
    name = meta.get("shortName") or meta.get("symbol", ticker)

    result = StockDataResponse(
        info=StockInfo(
            ticker=ticker.upper(),
            name=name,
            market="us",
            sector=None,
            industry=None,
            marketCap=None,
            currency=meta.get("currency", "USD"),
        ),
        ohlcv=ohlcv,
        currentPrice=last.close,
        change=change,
        changePercent=change_pct,
    )

    ttl = OHLCV_INTRADAY_TTL if period in ("1d", "5d") else OHLCV_DAILY_TTL
    cache.set(cache_key, result, ttl)
    return result


def get_us_fundamentals(ticker: str) -> FundamentalsResponse:
    cache_key = f"us_fundamentals:{ticker}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    # Try quoteSummary first; fall back to empty if blocked
    summary = _fetch_quote_summary(ticker)
    stats = summary.get("defaultKeyStatistics", {})
    fin = summary.get("financialData", {})
    detail = summary.get("summaryDetail", {})
    price_info = summary.get("price", {})

    def _raw(d: dict, key: str):
        v = d.get(key, {})
        return v.get("raw") if isinstance(v, dict) else v

    result = FundamentalsResponse(
        ticker=ticker.upper(),
        pe=_raw(detail, "trailingPE"),
        forwardPe=_raw(stats, "forwardPE") or _raw(detail, "forwardPE"),
        pb=_raw(stats, "priceToBook"),
        ps=_raw(detail, "priceToSalesTrailing12Months"),
        roe=_raw(fin, "returnOnEquity"),
        revenueGrowth=_raw(fin, "revenueGrowth"),
        earningsGrowth=_raw(fin, "earningsGrowth"),
        dividendYield=_raw(detail, "dividendYield"),
        debtToEquity=_raw(fin, "debtToEquity"),
        freeCashFlow=_raw(fin, "freeCashflow"),
        marketCap=_raw(price_info, "marketCap"),
    )

    # Only cache if we got real data; otherwise use short TTL
    has_data = any([result.pe, result.forwardPe, result.pb, result.marketCap])
    cache.set(cache_key, result, FUNDAMENTALS_TTL if has_data else 60)
    return result
