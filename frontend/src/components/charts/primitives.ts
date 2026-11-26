export function linePath(values: number[], width: number, height: number, max: number, min = 0) {
  if (values.length === 0) return ''
  const span = Math.max(1, max - min)
  const step = values.length > 1 ? width / (values.length - 1) : width
  return values
    .map((value, index) => {
      const x = index * step
      const y = height - ((value - min) / span) * height
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

export function smoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0].x},${points[0].y}`
  let d = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const midX = (p0.x + p1.x) / 2
    d += ` C${midX},${p0.y} ${midX},${p1.y} ${p1.x},${p1.y}`
  }
  return d
}

