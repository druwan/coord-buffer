import { useMemo, useState } from "react"
import type { PolygonPublic } from "@/client"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { BasePolygonMap } from "./BasePolygonMap"

type ExternalPolygon = {
  msid: number
  nameofarea: string
  positionindicator: string
  geom: {
    type: "Polygon"
    coordinates: number[][][]
  }
}

const createColorScale = (externalPolygons: ExternalPolygon[]) => {
  const sorted = [...externalPolygons].sort((a, b) => a.msid - b.msid)
  const total = sorted.length

  const map = new Map<number, number>()
  sorted.forEach((p, index) => {
    const hue = (index / total) * 360
    map.set(p.msid, hue)
  })
  return map
}

export const ViewPolygons = ({
  externalPolygons,
  userPolygons,
}: {
  externalPolygons: ExternalPolygon[]
  userPolygons: PolygonPublic[]
}) => {
  const [showBuffered, setShowBuffered] = useState(true)

  const layers = useMemo(() => {
    const colorMap = createColorScale(externalPolygons)

    const externalLayers = externalPolygons.map((p) => {
      const hue = colorMap.get(p.msid) ?? 0
      return {
        id: `external-${p.msid}`,
        geometry: p.geom,
        color: `hsl(${hue}, 100%, 50%)`,
        opacity: 1,
        fillOpacity: 0.3,
        meta: {
          name: p.nameofarea,
        },
      }
    })

    const userLayers = userPolygons.map((p) => {
      const baseHue = colorMap.get(p.msid) ?? 0
      const shiftedHue = (baseHue + 45) % 360
      return {
        id: `user-${p.id}`,
        geometry: p.buffered_geometry,
        color: `hsl(${shiftedHue}, 100%, 50%)`,
        opacity: showBuffered ? 1 : 0,
        fillOpacity: showBuffered ? 0.2 : 0,
        meta: {
          name: p.nameofarea,
          bufferSize: p.buffer_size,
        },
      }
    })

    return [...externalLayers, ...userLayers]
  }, [externalPolygons, userPolygons, showBuffered])

  return (
    <div className="relative h-full w-full">
      <BasePolygonMap polygons={layers} autoFit />
      <div className="flex items-center space-x-2 absolute top-4 right-4 z-1000 bg-background/5 backdrop-blur rounded-lg">
        <Switch
          id="show-buffered"
          checked={showBuffered}
          onCheckedChange={setShowBuffered}
        />
        <Label htmlFor="show-buffered">Show User Polygons</Label>
      </div>
    </div>
  )
}
