import type { ColumnDef } from "@tanstack/react-table"
import { Check, Copy } from "lucide-react"

import type { PolygonPublic } from "@/client"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { PolygonActionsMenu } from "./PolygonActionsMenu"

function CopyId({ id }: { id: string }) {
  const [copiedText, copy] = useCopyToClipboard()
  const isCopied = copiedText === id

  return (
    <div className="flex items-center gap-1.5 group">
      <span className="font-mono text-xs text-muted-foreground">{id}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copy(id)}
      >
        {isCopied ? (
          <Check className="size-3 text-green-500" />
        ) : (
          <Copy className="size-3" />
        )}
        <span className="sr-only">Copy ID</span>
      </Button>
    </div>
  )
}

function CopyBuffered({
  buffer_size,
  buffered_geometry,
}: {
  buffer_size: number
  buffered_geometry: any
}) {
  const [copiedText, copy] = useCopyToClipboard()
  if (!buffered_geometry || !buffer_size) {
    return <span className="italic text-muted-foreground">No buffer</span>
  }

  const formatCoordinates = () => {
    if (buffered_geometry.type !== "Polygon") return ""

    const coords: number[][] = buffered_geometry.coordinates[0]

    return coords.map(([lng, lat]) => `${lat}, ${lng}`).join("\n")
  }
  const formatted = formatCoordinates()
  const isCopied = copiedText === formatted

  return (
    <div className="flex items-center gap-1.5 group">
      <span className="text-muted-foreground">{buffer_size} Nm</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copy(formatted)}
      >
        {isCopied ? (
          <Check className="size-3 text-green-500" />
        ) : (
          <Copy className="size-3" />
        )}
        <span className="sr-only">Copy coordinates</span>
      </Button>
    </div>
  )
}

export const columns: ColumnDef<PolygonPublic>[] = [
  {
    accessorKey: "title",
    header: "TMA",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.title}</span>
    ),
  },
  {
    accessorKey: "positionindicator",
    header: "ICAO",
    cell: ({ row }) => <CopyId id={row.original.positionindicator} />,
  },
  {
    accessorKey: "buffer_size",
    header: "Buffer Size",
    cell: ({ row }) => {
      return (
        <CopyBuffered
          buffer_size={row.original.buffer_size}
          buffered_geometry={row.original.buffered_geometry}
        />
      )
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <PolygonActionsMenu polygon={row.original} />
      </div>
    ),
  },
]
