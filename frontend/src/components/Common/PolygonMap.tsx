import { useEffect, useMemo } from "react"
import { MapContainer, Polygon, TileLayer, useMap } from "react-leaflet"
import * as L from "leaflet"


type PolygonMapProps = {
  polygon?: {
    geom?: string | null
    nameofarea?: string
  } | null
}

const DEFAULT_CENTER: [number, number] = [59.33126388211133, 18.081407431369865]
const DEFAULT_ZOOM = 6



function parseCoordinates(geom?: string | null): L.LatLngTuple[][] | null {
  if (!geom) return null
  try {
    const geo = JSON.parse(geom)
    if (geo.type === "Polygon") {
      return geo.coordinates.map((ring: [number, number][]) =>
        ring.map(([lng, lat]) => [lat, lng] as L.LatLngTuple)
      )
    }
    if (geo.type === "MultiPolygon") {
      // MultiPolygon: flatten top-level array to Polygon arrays
      return geo.coordinates.map((poly: any[]) =>
        poly[0].map(([lng, lat]: [number, number]) => [lat, lng] as L.LatLngTuple)
      )
    }
  } catch {
    const match = geom.match(/\(\(([^)]+)\)\)/)
    if (match) {
      const coords = match[1]
        .split(",")
        .map((pair) => pair.trim().split(" ").map(Number))
        .map(([lng, lat]): L.LatLngTuple => [lat, lng])
      return [coords]
    }
  }
  return null
}

function PolygonHandler({ geom }: { geom?: string | null }) {
  const map = useMap()
  useEffect(() => {
    if (!geom) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
      return
    }
    const coords = parseCoordinates(geom)
    if (!coords || coords.length === 0) return
    const latlongs = coords.flatMap((ring) => ring)
    const bounds = L.latLngBounds(latlongs)
    map.flyToBounds(bounds, { padding: [40, 40], duration: 1 })
  }, [geom, map])
  return null
}

export const PolygonMap = ({ polygon }: PolygonMapProps) => {
  const coords = useMemo(() => parseCoordinates(polygon?.geom), [polygon])

  return (
    < MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      key={polygon?.geom ?? "default"}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />
      {coords && <Polygon positions={coords} pathOptions={{ color: "dodgerblue", weight: 2, fillOpacity: 0.3 }} />}
      <PolygonHandler geom={polygon?.geom} />
    </MapContainer >
  )
}
