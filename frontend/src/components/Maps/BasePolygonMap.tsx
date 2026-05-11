import maplibregl, { Popup } from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

type PolygonLayer = {
  id: string | number;
  geometry: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.Polygon>;
  color: string;
  opacity?: number;
  fillOpacity?: number;
  weight: number;
  dashArray?: string;
  meta: {
    name: string;
    bufferSize?: number;
  };
};

type BasePolygonMapProps = {
  polygons: PolygonLayer[];
  autoFit?: boolean;
};

export const BasePolygonMap = ({
  polygons,
  autoFit = false,
}: BasePolygonMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Init MapLibre GL Map
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'http://localhost:3005/styles/positron.json',
      center: [18.0814, 59.3312],
      zoom: 4.5,
    });

    const map = mapRef.current;

    map.on('load', () => {
      // polygon source / layers only after style loaded
      polygons.forEach((poly) => {
        const sourceId = `poly-source-${poly.id}`;
        const fillLayerId = `poly-fill-${poly.id}`;
        const lineLayerId = `poly-line-${poly.id}`;

        // add source
        map.addSource(sourceId, {
          type: 'geojson',
          data: poly.geometry,
        });

        // add fill
        map.addLayer({
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': poly.color,
            'fill-opacity': poly.fillOpacity ?? 0.3,
          },
        });

        // outline
        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': poly.color,
            'line-opacity': poly.opacity ?? 1,
            'line-width': poly.weight ?? 2,
            'line-dasharray':
              poly.dashArray?.split(',').map(Number) ?? undefined,
          },
        });

        // popup on click
        map.on('click', fillLayerId, (e) => {
          new Popup()
            .setLngLat(e.lngLat)
            .setHTML(
              poly.meta.bufferSize
                ? `${poly.meta.name} + ${poly.meta.bufferSize} Nm buffer`
                : poly.meta.name,
            )
            .addTo(map);
        });

        map.on('mouseenter', fillLayerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', fillLayerId, () => {
          map.getCanvas().style.cursor = '';
        });
      });

      // auto-fit
      if (autoFit && polygons.length > 0) {
        const bounds = new maplibregl.LngLatBounds();

        polygons.forEach((poly) => {
          const geom = poly.geometry.geometry;
          if (geom.type === 'Polygon') {
            geom.coordinates.forEach((ring) =>
              ring.forEach((coord) => bounds.extend(coord as [number, number])),
            );
          } else {
            geom.coordinates.forEach((polygon) =>
              polygon.forEach((ring) =>
                ring.forEach((coord) =>
                  bounds.extend(coord as [number, number]),
                ),
              ),
            );
          }
        });

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 40 });
        }
      }
    });

    return () => {
      mapRef.current?.remove();
    };
  }, [polygons, autoFit]);

  return <div ref={mapContainer} className='h-full w-full' />;
};
