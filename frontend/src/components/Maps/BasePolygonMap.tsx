import L from "leaflet"
import { useEffect } from "react"
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet"

const DEFAULT_ZOOM = 6
const DEFAULT_CENTER: [number, number] = [59.33126388211133, 18.081407431369865]

type PolygonLayer = {
  id: string | number
  geometry: any
  color: string
  opacity?: number
  fillOpacity?: number
  meta: {
    name: string
    bufferSize?: number
  }
}

type BasePolygonMapProps = {
  polygons: PolygonLayer[]
  autoFit?: boolean
}

const AutoFit = ({ polygons }: { polygons: PolygonLayer[] }) => {
  const map = useMap()

  useEffect(() => {
    if (!polygons.length) return
    const group = L.featureGroup(polygons.map((p) => L.geoJSON(p.geometry)))

    const bounds = group.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds)
    }
  }, [polygons, map])
  return null
}

function createTooltipContent(meta: PolygonLayer["meta"]) {
  const container = L.DomUtil.create("div")
  const title = L.DomUtil.create(
    "div",
    "bg-background/5 backdrop-blur rounded-lg",
    container,
  )
  title.textContent = meta.bufferSize
    ? `${meta.name} + ${meta.bufferSize} Nm buffer`
    : meta.name
  return container
}

export const BasePolygonMap = ({
  polygons,
  autoFit = false,
}: BasePolygonMapProps) => {
  return (
    <MapContainer
      className="h-full w-full"
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
    >
      <TileLayer url="http://localhost:8081/styles/positron/{z}/{x}/{y}.png" />
      {polygons.map((poly) => (
        <GeoJSON
          key={poly.id}
          data={poly.geometry}
          style={{
            color: poly.color,
            opacity: poly.opacity ?? 1,
            fillOpacity: poly.fillOpacity ?? 0.3,
          }}
          onEachFeature={(_, layer) => {
            layer.bindTooltip(createTooltipContent(poly.meta), {
              sticky: true,
              direction: "top",
              opacity: 0.95,
            })
          }}
        />
      ))}
      {autoFit && <AutoFit polygons={polygons} />}
    </MapContainer>
  )
}
