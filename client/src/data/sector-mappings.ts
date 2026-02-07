export interface SupplyChainLink {
  usTicker: string
  usName: string
  krTicker: string
  krName: string
  relationship: string
  sector: string
}

export const SUPPLY_CHAIN_LINKS: SupplyChainLink[] = [
  // Semiconductors
  { usTicker: 'NVDA', usName: 'NVIDIA', krTicker: '000660', krName: 'SK하이닉스', relationship: 'HBM 메모리 공급', sector: '반도체' },
  { usTicker: 'NVDA', usName: 'NVIDIA', krTicker: '005930', krName: '삼성전자', relationship: 'DRAM/NAND 공급', sector: '반도체' },
  { usTicker: 'AAPL', usName: 'Apple', krTicker: '005930', krName: '삼성전자', relationship: 'OLED/메모리 공급', sector: '전자' },
  { usTicker: 'AAPL', usName: 'Apple', krTicker: '034730', krName: 'SK스퀘어', relationship: 'SK하이닉스 지주', sector: '전자' },
  // EV / Battery
  { usTicker: 'TSLA', usName: 'Tesla', krTicker: '373220', krName: 'LG에너지솔루션', relationship: '배터리 공급', sector: '2차전지' },
  { usTicker: 'TSLA', usName: 'Tesla', krTicker: '006400', krName: '삼성SDI', relationship: '배터리 공급', sector: '2차전지' },
  { usTicker: 'TSLA', usName: 'Tesla', krTicker: '051910', krName: 'LG화학', relationship: '양극재 공급', sector: '2차전지' },
  // Bio
  { usTicker: 'LLY', usName: 'Eli Lilly', krTicker: '207940', krName: '삼성바이오로직스', relationship: 'CDMO 위탁생산', sector: '바이오' },
  // Internet
  { usTicker: 'GOOG', usName: 'Google', krTicker: '035420', krName: 'NAVER', relationship: '검색 경쟁', sector: '인터넷' },
  { usTicker: 'META', usName: 'Meta', krTicker: '035720', krName: '카카오', relationship: 'SNS 경쟁', sector: '인터넷' },
  // Display
  { usTicker: 'AAPL', usName: 'Apple', krTicker: '034220', krName: 'LG디스플레이', relationship: 'LCD/OLED 패널', sector: '디스플레이' },
  // Shipbuilding
  { usTicker: 'XOM', usName: 'ExxonMobil', krTicker: '009540', krName: '한국조선해양', relationship: 'LNG선 발주', sector: '조선' },
]

export const SECTORS = [...new Set(SUPPLY_CHAIN_LINKS.map((l) => l.sector))]

export function findRelatedKr(usTicker: string): SupplyChainLink[] {
  return SUPPLY_CHAIN_LINKS.filter((l) => l.usTicker === usTicker.toUpperCase())
}

export function findRelatedUs(krTicker: string): SupplyChainLink[] {
  return SUPPLY_CHAIN_LINKS.filter((l) => l.krTicker === krTicker)
}
