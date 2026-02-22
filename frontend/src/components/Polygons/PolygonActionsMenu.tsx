import { EllipsisVertical } from "lucide-react"
import { useState } from "react"

import type { PolygonPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ViewPolygon } from "../Maps/ViewPolygon"
import DeletePolygon from "../Polygons/DeletePolygon"
import EditPolygon from "../Polygons/EditPolygon"

interface PolygonActionsMenuProps {
  polygon: PolygonPublic
}

export const PolygonActionsMenu = ({ polygon }: PolygonActionsMenuProps) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ViewPolygon polygon={polygon} />
        <EditPolygon polygon={polygon} onSuccess={() => setOpen(false)} />
        <DeletePolygon id={polygon.id} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
