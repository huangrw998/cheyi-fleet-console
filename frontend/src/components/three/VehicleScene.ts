import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createRenderer, applySceneTheme, type RendererContext } from './createRenderer'
import { loadVehicleModel } from './loadVehicleModel'
import { centerAndFit } from './fit'
import { PAINTS } from './paints'

export interface VehicleSceneCallbacks {
  onLoading: (percent: number) => void
  onLoaded: () => void
  onError: () => void
  onFullscreen: (value: boolean) => void
}

export class VehicleScene {
  private container: HTMLDivElement
  private ctx: RendererContext
  private controls: OrbitControls
  private initialCamera = new THREE.Vector3(4.8, 2.3, 6.2)
  private targetY = 0.65
  private paintMaterials: THREE.MeshStandardMaterial[] = []
  private paintIndex = 0
  private autoRotate = true
  private callbacks: VehicleSceneCallbacks
  private frame = 0
  private inViewport = true
  private documentVisible = !document.hidden
  private disposed = false
  private resizeTimer: number | null = null
  private resizeObserver: ResizeObserver
  private intersectionObserver: IntersectionObserver

  constructor(container: HTMLDivElement, theme: 'light' | 'dark', callbacks: VehicleSceneCallbacks) {
    this.container = container
    this.callbacks = callbacks
    this.ctx = createRenderer(container, theme)

    const controls = new OrbitControls(this.ctx.camera, this.ctx.renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.075
    controls.enablePan = false
    controls.minDistance = 2.5
    controls.maxDistance = 30
    controls.minPolarAngle = 0.35
    controls.maxPolarAngle = Math.PI / 2 - 0.04
    controls.target.set(0, 0.65, 0)
    controls.autoRotate = this.autoRotate
    controls.autoRotateSpeed = 0.9
    this.controls = controls

    this.resizeObserver = new ResizeObserver(() => this.ctx.resize())
    this.resizeObserver.observe(container)

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        this.inViewport = entries[0]?.isIntersecting ?? true
        if (this.shouldAnimate()) this.start()
        else this.stop()
      },
      { threshold: 0.1 },
    )
    this.intersectionObserver.observe(container)

    document.addEventListener('visibilitychange', this.onVisibility)
    document.addEventListener('fullscreenchange', this.onFullscreen)
    this.start()
  }

  load(url: string) {
    loadVehicleModel(
      url,
      (percent) => { if (!this.disposed) this.callbacks.onLoading(percent) },
      ({ model, paintMaterials }) => {
        if (this.disposed) return
        this.paintMaterials = paintMaterials
        this.ctx.scene.add(model)
        const fit = centerAndFit(model, this.ctx.camera, this.controls, this.initialCamera)
        this.targetY = fit.targetY
        this.applyPaint()
        this.callbacks.onLoading(100)
        this.callbacks.onLoaded()
      },
      () => {
        if (this.disposed) return
        this.callbacks.onLoading(100)
        this.callbacks.onError()
      },
    )
  }

  setPaint(index: number) {
    this.paintIndex = index
    this.applyPaint()
  }

  setAutoRotate(value: boolean) {
    this.autoRotate = value
    this.controls.autoRotate = value
  }

  setTheme(theme: 'light' | 'dark') {
    applySceneTheme(this.ctx, theme)
  }

  reset() {
    this.ctx.camera.position.copy(this.initialCamera)
    this.controls.target.set(0, this.targetY, 0)
    this.controls.update()
  }

  async toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await this.container.requestFullscreen()
  }

  dispose() {
    this.disposed = true
    this.stop()
    if (this.resizeTimer !== null) {
      window.clearTimeout(this.resizeTimer)
      this.resizeTimer = null
    }
    this.intersectionObserver.disconnect()
    this.resizeObserver.disconnect()
    document.removeEventListener('visibilitychange', this.onVisibility)
    document.removeEventListener('fullscreenchange', this.onFullscreen)
    this.controls.dispose()
    this.ctx.pmrem.dispose()
    this.ctx.scene.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      const material = mesh.material
      if (Array.isArray(material)) material.forEach((m) => m.dispose())
      else if (material) material.dispose()
    })
    this.ctx.renderer.dispose()
    this.ctx.renderer.domElement.remove()
    this.paintMaterials = []
  }

  private applyPaint() {
    const paint = PAINTS[this.paintIndex] ?? PAINTS[0]
    this.paintMaterials.forEach((material) => material.color.set(paint.hex))
  }

  private onVisibility = () => {
    this.documentVisible = !document.hidden
    if (this.shouldAnimate()) this.start()
    else this.stop()
  }

  private onFullscreen = () => {
    this.callbacks.onFullscreen(Boolean(document.fullscreenElement))
    if (this.resizeTimer !== null) window.clearTimeout(this.resizeTimer)
    this.resizeTimer = window.setTimeout(() => {
      this.resizeTimer = null
      this.ctx.resize()
    }, 60)
  }

  private shouldAnimate() {
    return this.inViewport && this.documentVisible && !this.disposed
  }

  private animate = () => {
    if (!this.shouldAnimate()) {
      this.frame = 0
      return
    }
    this.controls.update()
    this.ctx.renderer.render(this.ctx.scene, this.ctx.camera)
    this.frame = requestAnimationFrame(this.animate)
  }

  private start() {
    if (this.frame || !this.shouldAnimate()) return
    this.frame = requestAnimationFrame(this.animate)
  }

  private stop() {
    if (this.frame) cancelAnimationFrame(this.frame)
    this.frame = 0
  }
}