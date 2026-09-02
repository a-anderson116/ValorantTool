import { useEffect, useState } from 'react'
import { getMyProfile } from '../services/api'

export const REGIONS = ['na', 'eu', 'ap', 'kr', 'latam', 'br']

/**
 * Loads the signed-in player's own stats/matches from /api/player/me.
 * Region is remembered per-viewer in localStorage.
 */
export function useMyProfile(count = 10) {
  const [region, setRegionState] = useState(() => {
    try {
      return localStorage.getItem('vct_region') || 'na'
    } catch {
      return 'na'
    }
  })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function setRegion(r) {
    setRegionState(r)
    try {
      localStorage.setItem('vct_region', r)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getMyProfile({ region, count })
      .then((res) => {
        if (active) setData(res)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [region, count])

  return { data, loading, error, region, setRegion }
}
