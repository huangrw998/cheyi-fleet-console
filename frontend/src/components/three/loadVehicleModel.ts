import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { PAINTS } from './paints'

export interface VehicleLoadResult {
  model: THREE.Group
  paintMaterials: THREE.MeshStandardMaterial[]
}

export function loadVehicleModel(
  url: string,
  onProgress: (percent: number) => void,
  onLoad: (result: VehicleLoadResult) => void,
  onError: () => void,
) {
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene
      const paintMaterials: THREE.MeshStandardMaterial[] = []
      model.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        materials.forEach((mat) => {
          if (!(mat instanceof THREE.MeshStandardMaterial) || (mat.name !== 'paint' && mat.name !== 'blue')) return
          const cloned = mat.clone()
          // Innerscene 的 paint 材质带橙色 baseColorTexture，去掉贴图后才能准确换色。
          cloned.map = null
          cloned.color = new THREE.Color(PAINTS[0].hex)
          cloned.metalness = Math.max(cloned.metalness, 0.35)
          cloned.roughness = Math.min(cloned.roughness, 0.42)
          cloned.needsUpdate = true
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => (m === mat ? cloned : m))
          } else {
            mesh.material = cloned
          }
          paintMaterials.push(cloned)
        })
      })
      onLoad({ model, paintMaterials })
    },
    (event) => {
      if (event.total > 0) onProgress(Math.min(96, Math.round((event.loaded / event.total) * 100)))
      else onProgress(50)
    },
    onError,
  )
}