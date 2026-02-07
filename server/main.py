from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import stocks, exchange, fundamentals, market_data
from utils.error_handlers import register_error_handlers

app = FastAPI(title="Investment Agent Swarm API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(stocks.router)
app.include_router(exchange.router)
app.include_router(fundamentals.router)
app.include_router(market_data.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
