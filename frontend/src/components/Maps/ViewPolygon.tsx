import { MapIcon } from "lucide-react"
import { useState } from "react"
import type { PolygonPublic } from "@/client"
import { BasePolygonMap } from "../Maps/BasePolygonMap"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { DropdownMenuItem } from "../ui/dropdown-menu"

export const ViewPolygon = ({ polygon }: { polygon: PolygonPublic }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <MapIcon />
        View Polygon
      </DropdownMenuItem>

      <DialogContent className="sm:max-w-4xl h-125">
        <DialogHeader>
          <DialogTitle>Polygon Map Viewer</DialogTitle>
        </DialogHeader>

        <BasePolygonMap
          polygons={[
            {
              id: `orig-${polygon.id}`,
              geometry: polygon.original_geometry,
              color: "red",
            },
            {
              id: `buff-${polygon.id}`,
              geometry: polygon.buffered_geometry,
              color: "blue",
            },
          ]}
          autoFit
        />
      </DialogContent>
    </Dialog>
  )
}
