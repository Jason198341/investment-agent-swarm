from fastapi import APIRouter, Query
from services.us_stocks import get_us_stock
from services.kr_stocks import get_kr_stock
from models.stock import StockDataResponse

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("/us/{ticker}", response_model=StockDataResponse)
def us_stock(ticker: str, period: str = Query("6mo")):
    return get_us_stock(ticker.upper(), period)


@router.get("/kr/{ticker}", response_model=StockDataResponse)
def kr_stock(ticker: str, period: str = Query("6mo")):
    return get_kr_stock(ticker, period)
