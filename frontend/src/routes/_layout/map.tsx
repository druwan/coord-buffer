import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { PolygonsService } from "@/client"
import { ViewPolygons } from "@/components/Maps/ViewPolygons"
import { useExternalPolygons } from "@/hooks/useExternalPolygons"

function getPolygonsQueryOptions() {
  return {
    queryFn: () => PolygonsService.readPolygons({ skip: 0, limit: 100 }),
    queryKey: ["polygons"],
  }
}

export const Route = createFileRoute("/_layout/map")({
  component: MapRoute,
  head: () => ({
    meta: [
      {
        title: "Map",
      },
    ],
  }),
})

function MapRoute() {
  const { data: polygons } = useSuspenseQuery(getPolygonsQueryOptions())
  const { data: externalPolygons } = useExternalPolygons()

  return (
    <div className="relative h-full w-full">
      <ViewPolygons
        externalPolygons={externalPolygons}
        userPolygons={polygons.data ?? []}
      />
    </div>
  )
}
