import numpy as np
from models.stock import IndicatorValue


def calc_sma(closes: list[float], period: int) -> float | None:
    if len(closes) < period:
        return None
    return round(float(np.mean(closes[-period:])), 4)


def calc_ema(closes: list[float], period: int) -> list[float]:
    if not closes:
        return []
    k = 2 / (period + 1)
    result = [closes[0]]
    for i in range(1, len(closes)):
        result.append(closes[i] * k + result[-1] * (1 - k))
    return result


def calc_rsi(closes: list[float], period: int = 14) -> float | None:
    if len(closes) < period + 1:
        return None

    gains = []
    losses = []
    for i in range(1, len(closes)):
        diff = closes[i] - closes[i - 1]
        gains.append(max(diff, 0))
        losses.append(max(-diff, 0))

    avg_gain = np.mean(gains[:period])
    avg_loss = np.mean(losses[:period])

    for i in range(period, len(gains)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100 - (100 / (1 + rs)), 2)


def calc_macd(closes: list[float]) -> tuple[float, float, float] | None:
    if len(closes) < 35:  # need enough data for EMA26 + signal9
        return None
    ema12 = calc_ema(closes, 12)
    ema26 = calc_ema(closes, 26)
    macd_line = [a - b for a, b in zip(ema12, ema26)]
    signal_line = calc_ema(macd_line, 9)
    if not signal_line:
        return None
    val = round(macd_line[-1], 4)
    sig = round(signal_line[-1], 4)
    hist = round(val - sig, 4)
    return val, sig, hist


def calc_bollinger(closes: list[float], period: int = 20, mult: float = 2.0) -> tuple[float, float, float] | None:
    if len(closes) < period:
        return None
    window = closes[-period:]
    middle = float(np.mean(window))
    std = float(np.std(window))
    return (
        round(middle + mult * std, 4),
        round(middle, 4),
        round(middle - mult * std, 4),
    )


def compute_indicators(closes: list[float]) -> IndicatorValue:
    rsi_val = calc_rsi(closes)
    macd_result = calc_macd(closes)
    bb = calc_bollinger(closes)

    return IndicatorValue(
        rsi14=rsi_val,
        macd_value=macd_result[0] if macd_result else None,
        macd_signal=macd_result[1] if macd_result else None,
        macd_histogram=macd_result[2] if macd_result else None,
        bb_upper=bb[0] if bb else None,
        bb_middle=bb[1] if bb else None,
        bb_lower=bb[2] if bb else None,
        sma20=calc_sma(closes, 20),
        sma50=calc_sma(closes, 50),
        sma200=calc_sma(closes, 200),
    )
