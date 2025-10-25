import * as L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet';

type PolygonMapProps = {
  polygon?: {
    id?: string;
    title?: string;
    buffer_size?: number;
    positionindicator?: string;
    original_geometry?: any;
    buffered_geometry?: any;
    nameofarea?: string;
  } | null;
};

const DEFAULT_CENTER: [number, number] = [
  59.33126388211133, 18.081407431369865,
];
const DEFAULT_ZOOM = 6;

function parseCoordinates(geom?: any): L.LatLngTuple[][] | null {
  if (!geom) return null;

  try {
    const geo = typeof geom === 'string' ? JSON.parse(geom) : geom;

    if (geo.type === 'Polygon') {
      return geo.coordinates.map((ring: [number, number][]) =>
        ring.map(([lng, lat]) => [lat, lng] as L.LatLngTuple)
      );
    }

    if (geo.type === 'MultiPolygon') {
      return geo.coordinates[0].map((ring: [number, number][]) =>
        ring.map(([lng, lat]) => [lat, lng] as L.LatLngTuple)
      );
    }
  } catch (e) {
    console.error(`Failed to parse geometry: {e}`);
  }
  return null;
}

function PolygonHandler({
  polygons,
}: {
  polygons: (L.LatLngTuple[][] | null)[];
}) {
  const map = useMap();

  useEffect(() => {
    const coords = polygons.filter(
      (c): c is L.LatLngTuple[][] => !!c && c.length > 0
    );

    if (coords.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    const allLatLngs = coords.flatMap((rings) => rings.flat());
    const bounds = L.latLngBounds(allLatLngs);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [polygons, map]);
  return null;
}

export const PolygonMap = ({ polygon }: PolygonMapProps) => {
  const originalCoords = useMemo(
    () => parseCoordinates(polygon?.original_geometry),
    [polygon?.original_geometry]
  );
  const bufferedCoords = useMemo(
    () => parseCoordinates(polygon?.buffered_geometry),
    [polygon?.buffered_geometry]
  );

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      key={polygon ? 'with-polygon' : 'default'}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        maxZoom={20}
      />
      {polygon?.original_geometry && (
        <Polygon
          positions={originalCoords as L.LatLngExpression[][]}
          pathOptions={{ color: 'blue', weight: 2, fillOpacity: 0.3 }}
        />
      )}

      {polygon?.buffered_geometry && (
        <Polygon
          positions={bufferedCoords as L.LatLngExpression[][]}
          pathOptions={{ color: 'red', weight: 2, fillOpacity: 0.3 }}
        />
      )}

      <PolygonHandler polygons={[originalCoords, bufferedCoords]} />
    </MapContainer>
  );
};
