let currentUtterance: SpeechSynthesisUtterance | null = null

export function speak(text: string, lang: 'en' | 'ko' = 'ko'): void {
  stop()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang === 'ko' ? 'ko-KR' : 'en-US'
  utterance.rate = 1.0
  utterance.pitch = 1.0
  currentUtterance = utterance
  speechSynthesis.speak(utterance)
}

export function stop(): void {
  speechSynthesis.cancel()
  currentUtterance = null
}

export function isSpeaking(): boolean {
  return speechSynthesis.speaking
}

export function onEnd(callback: () => void): void {
  if (currentUtterance) {
    currentUtterance.onend = callback
  }
}
