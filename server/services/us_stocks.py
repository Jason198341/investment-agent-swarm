import yfinance as yf
from datetime import datetime
from services.cache import cache
from models.stock import OHLCVItem, StockInfo, StockDataResponse, FundamentalsResponse

# TTL constants (seconds)
OHLCV_INTRADAY_TTL = 300    # 5 min
OHLCV_DAILY_TTL = 3600      # 1 hour
INFO_TTL = 3600              # 1 hour
FUNDAMENTALS_TTL = 3600      # 1 hour


def get_us_stock(ticker: str, period: str = "6mo") -> StockDataResponse:
    cache_key = f"us_stock:{ticker}:{period}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    tk = yf.Ticker(ticker)
    hist = tk.history(period=period)

    if hist.empty:
        raise ValueError(f"No data found for US ticker: {ticker}")

    info = tk.info
    ohlcv = []
    for date, row in hist.iterrows():
        ohlcv.append(OHLCVItem(
            date=date.strftime("%Y-%m-%d"),
            open=round(row["Open"], 2),
            high=round(row["High"], 2),
            low=round(row["Low"], 2),
            close=round(row["Close"], 2),
            volume=int(row["Volume"]),
        ))

    last = ohlcv[-1] if ohlcv else None
    prev = ohlcv[-2] if len(ohlcv) >= 2 else None
    current_price = last.close if last else 0
    change = round(current_price - (prev.close if prev else current_price), 2)
    change_pct = round((change / prev.close * 100) if prev and prev.close else 0, 2)

    result = StockDataResponse(
        info=StockInfo(
            ticker=ticker.upper(),
            name=info.get("shortName", ticker),
            market="us",
            sector=info.get("sector"),
            industry=info.get("industry"),
            marketCap=info.get("marketCap"),
            currency="USD",
        ),
        ohlcv=ohlcv,
        currentPrice=current_price,
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

    tk = yf.Ticker(ticker)
    info = tk.info

    result = FundamentalsResponse(
        ticker=ticker.upper(),
        pe=info.get("trailingPE"),
        forwardPe=info.get("forwardPE"),
        pb=info.get("priceToBook"),
        ps=info.get("priceToSalesTrailing12Months"),
        roe=info.get("returnOnEquity"),
        revenueGrowth=info.get("revenueGrowth"),
        earningsGrowth=info.get("earningsGrowth"),
        dividendYield=info.get("dividendYield"),
        debtToEquity=info.get("debtToEquity"),
        freeCashFlow=info.get("freeCashflow"),
        marketCap=info.get("marketCap"),
    )

    cache.set(cache_key, result, FUNDAMENTALS_TTL)
    return result
