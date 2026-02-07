from fastapi import APIRouter
from services.us_stocks import get_us_fundamentals
from services.kr_stocks import get_kr_fundamentals
from models.stock import FundamentalsResponse

router = APIRouter(prefix="/api/fundamentals", tags=["fundamentals"])


@router.get("/us/{ticker}", response_model=FundamentalsResponse)
def us_fundamentals(ticker: str):
    return get_us_fundamentals(ticker.upper())


@router.get("/kr/{ticker}", response_model=FundamentalsResponse)
def kr_fundamentals(ticker: str):
    return get_kr_fundamentals(ticker)
