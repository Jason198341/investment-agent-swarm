from pydantic import BaseModel
from typing import Optional


class OHLCVItem(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockInfo(BaseModel):
    ticker: str
    name: str
    market: str  # 'us' | 'kr'
    sector: Optional[str] = None
    industry: Optional[str] = None
    marketCap: Optional[float] = None
    currency: str  # 'USD' | 'KRW'


class StockDataResponse(BaseModel):
    info: StockInfo
    ohlcv: list[OHLCVItem]
    currentPrice: float
    change: float
    changePercent: float


class ExchangeRateResponse(BaseModel):
    usdKrw: float
    updatedAt: str
    source: str


class FundamentalsResponse(BaseModel):
    ticker: str
    pe: Optional[float] = None
    forwardPe: Optional[float] = None
    pb: Optional[float] = None
    ps: Optional[float] = None
    roe: Optional[float] = None
    revenueGrowth: Optional[float] = None
    earningsGrowth: Optional[float] = None
    dividendYield: Optional[float] = None
    debtToEquity: Optional[float] = None
    freeCashFlow: Optional[float] = None
    marketCap: Optional[float] = None


class MarketOverviewResponse(BaseModel):
    sp500: dict
    kospi: dict
    nasdaq: dict
    kosdaq: dict
    vix: float
    usdKrw: float
    updatedAt: str


class IndicatorValue(BaseModel):
    rsi14: Optional[float] = None
    macd_value: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_histogram: Optional[float] = None
    bb_upper: Optional[float] = None
    bb_middle: Optional[float] = None
    bb_lower: Optional[float] = None
    sma20: Optional[float] = None
    sma50: Optional[float] = None
    sma200: Optional[float] = None
