import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function useOtpCountdown(initialSeconds = 30) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const timerRef = useRef(null)

  useEffect(() => {
    setSecondsLeft(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 0) return 0
        return s - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const restart = useCallback(() => {
    setSecondsLeft(initialSeconds)
  }, [initialSeconds])

  const formatted = useMemo(() => {
    const mm = Math.floor(secondsLeft / 60)
    const ss = secondsLeft % 60
    const padded = String(ss).padStart(2, '0')
    return `${String(mm).padStart(2, '0')}:${padded}`
  }, [secondsLeft])

  return { secondsLeft, formatted, restart }
}

