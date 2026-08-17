import { useState, useEffect } from 'react'
import * as Location from 'expo-location'

export interface GPSLocation {
  latitude: number
  longitude: number
  accuracy: number | null
}

export function useGPSLocation() {
  const [location, setLocation] = useState<GPSLocation | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchLocation = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Quyền truy cập vị trí bị từ chối')
        setIsLoading(false)
        return
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
      })
    } catch (err) {
      setErrorMsg('Không thể lấy vị trí hiện tại')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLocation()
  }, [])

  return { location, errorMsg, isLoading, refreshLocation: fetchLocation }
}
