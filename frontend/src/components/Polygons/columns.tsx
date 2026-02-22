import type { ColumnDef } from "@tanstack/react-table"
import { Check, Copy } from "lucide-react"

import type { PolygonPublic } from "@/client"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { cn } from "@/lib/utils"
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
      const buffer_size = row.original.buffer_size
      return (
        <span
          className={cn(
            "max-w-xs truncate block text-muted-foreground",
            !buffer_size && "italic",
          )}
        >
          {buffer_size || "No description"}
        </span>
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
