import { MapIcon } from "lucide-react"
import { useMemo, useState } from "react"
import type { PolygonPublic } from "@/client"
import { BasePolygonMap } from "../Maps/BasePolygonMap"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { DropdownMenuItem } from "../ui/dropdown-menu"

const createColorScale = (polygons: PolygonPublic[]) => {
  const sorted = [...polygons].sort((a, b) => a.msid - b.msid)
  const total = sorted.length

  const map = new Map<number, number>()
  sorted.forEach((p, index) => {
    const hue = (index / total) * 360
    map.set(p.msid, hue)
  })
  return map
}

export const ViewPolygon = ({ polygon }: { polygon: PolygonPublic }) => {
  const [isOpen, setIsOpen] = useState(false)

  const layers = useMemo(() => {
    const colorMap = createColorScale([polygon])
    const baseHue = colorMap.get(polygon.msid) ?? 0

    return [
      {
        id: `orig-${polygon.id}`,
        geometry: polygon.original_geometry,
        color: `hsl(${baseHue}, 100%, 50%)`,
        opacity: 1,
        fillOpacity: 0.3,
        meta: {
          name: polygon.nameofarea,
        },
      },
      {
        id: `buff-${polygon.id}`,
        geometry: polygon.buffered_geometry,
        color: `hsl(${(baseHue + 45) % 360}, 100%, 50%)`,
        opacity: 1,
        fillOpacity: 0.2,
        meta: {
          name: polygon.nameofarea,
          bufferSize: polygon.buffer_size,
        },
      },
    ]
  }, [polygon])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <MapIcon />
        View Polygon
      </DropdownMenuItem>

      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Polygon Map Viewer</DialogTitle>
        </DialogHeader>
        <div className="flex-1">
          <BasePolygonMap polygons={layers} autoFit />
        </div>
      </DialogContent>
    </Dialog>
  )
}
