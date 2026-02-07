from fastapi import APIRouter
from services.bok_exchange import get_usd_krw
from models.stock import ExchangeRateResponse

router = APIRouter(prefix="/api/exchange", tags=["exchange"])


@router.get("/usd-krw", response_model=ExchangeRateResponse)
def usd_krw():
    return get_usd_krw()
