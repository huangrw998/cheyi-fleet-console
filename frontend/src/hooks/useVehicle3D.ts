import { useCallback, useEffect, useRef, useState } from 'react'
import { useTheme } from '@/app/theme'
import { VehicleScene } from '@/components/three/VehicleScene'
import { PAINTS } from '@/components/three/paints'

export function useVehicle3D(modelKey: string) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<VehicleScene | null>(null)
  const [loading, setLoading] = useState(0)
  const [error, setError] = useState(false)
  const [paintIndex, setPaintIndex] = useState(0)
  const [autoRotate, setAutoRotate] = useState(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [fullscreen, setFullscreen] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    setLoading(0)
    setError(false)
    const scene = new VehicleScene(container, theme, {
      onLoading: setLoading,
      onLoaded: () => setLoading(100),
      onError: () => {
        setError(true)
        setLoading(100)
      },
      onFullscreen: setFullscreen,
    })
    sceneRef.current = scene
    scene.load(`/models/${modelKey}.glb`)
    return () => {
      scene.dispose()
      sceneRef.current = null
    }
    // Theme changes are applied by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelKey])

  useEffect(() => {
    sceneRef.current?.setTheme(theme)
  }, [theme])

  useEffect(() => {
    sceneRef.current?.setPaint(paintIndex)
  }, [paintIndex])

  useEffect(() => {
    sceneRef.current?.setAutoRotate(autoRotate)
  }, [autoRotate])

  const reset = useCallback(() => sceneRef.current?.reset(), [])
  const toggleFullscreen = useCallback(() => void sceneRef.current?.toggleFullscreen(), [])
  const paints = PAINTS

  return {
    containerRef,
    loading,
    error,
    paintIndex,
    setPaintIndex,
    autoRotate,
    setAutoRotate,
    fullscreen,
    reset,
    toggleFullscreen,
    paints,
  }
}