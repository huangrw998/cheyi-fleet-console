import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export interface RendererContext {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  pmrem: THREE.PMREMGenerator
  ground: THREE.Mesh
  resize: () => void
}

export function createRenderer(container: HTMLDivElement, theme: 'light' | 'dark'): RendererContext {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 100)
  camera.position.set(4.8, 2.3, 6.2)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = theme === 'dark' ? 0.92 : 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  Object.assign(renderer.domElement.style, {
    width: '100%',
    height: '100%',
    display: 'block',
    position: 'absolute',
    inset: '0',
    zIndex: '1',
    touchAction: 'pan-y',
  })
  renderer.domElement.setAttribute('role', 'img')
  renderer.domElement.setAttribute('aria-label', '3D 车身示意，可拖拽旋转')
  container.appendChild(renderer.domElement)

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 1.15

  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1f26, 1.1))
  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(6, 9, 6)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 40
  key.shadow.camera.left = -9
  key.shadow.camera.right = 9
  key.shadow.camera.top = 9
  key.shadow.camera.bottom = -9
  key.shadow.bias = -0.0004
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xffffff, 0.8)
  fill.position.set(-5, 4, -4)
  scene.add(fill)

  const ground = new THREE.Mesh(new THREE.CircleGeometry(7, 64), new THREE.ShadowMaterial({ opacity: theme === 'dark' ? 0.32 : 0.16 }))
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const resize = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  return { scene, camera, renderer, pmrem, ground, resize }
}

export function applySceneTheme(ctx: RendererContext, theme: 'light' | 'dark') {
  ctx.renderer.toneMappingExposure = theme === 'dark' ? 0.92 : 1.05
  const material = ctx.ground.material
  if (material instanceof THREE.ShadowMaterial) {
    material.opacity = theme === 'dark' ? 0.32 : 0.16
  }
}