import * as THREE from 'three'

interface ControlsLike {
  target: THREE.Vector3
  update: () => void
}

export function centerAndFit(
  model: THREE.Group,
  camera: THREE.PerspectiveCamera,
  controls: ControlsLike,
  initialCamera: THREE.Vector3,
) {
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  model.position.x -= center.x
  model.position.z -= center.z
  model.position.y -= box.min.y

  const aspect = Math.max(0.6, camera.aspect)
  const aspectFactor = aspect < 1.4 ? 1.55 : aspect < 1.75 ? 1.06 : 1.0
  const baseDistance = Math.max(5.8, Math.max(size.x, size.z) * 1.15)
  const distance = baseDistance * aspectFactor
  const direction = new THREE.Vector3(0.62, 0.38, 1).normalize()
  const targetY = Math.max(0.55, size.y * 0.42)
  camera.position.copy(direction.multiplyScalar(distance).add(new THREE.Vector3(0, targetY, 0)))
  initialCamera.copy(camera.position)
  controls.target.set(0, targetY, 0)
  controls.update()
  return { targetY, size }
}