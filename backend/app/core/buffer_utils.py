import json
from shapely.geometry import shape, mapping
import geopandas as gpd

BUFFER_MULTIPLIER = 1652
DEFAULT_EPSG = 4326
METRIC_EPSG = 3006


def buffer_polygon(geojson_str: str, buffer_nm: float) -> str:
    """ "
    Buffer a polygon GeoJSON geometry by a distance in nautical miles.
    Returns the buffered geometry as a GeoJSON string.
    """
    geojson = json.loads(geojson_str)

    # Convert to shapely
    if geojson.get("type") == "FeatureCollection":
        geom = shape(geojson["features"][0]["geometry"])
    elif geojson.get("type") == "Feature":
        geom = shape(geojson["geometry"])
    elif geojson.get("type") in ("Polygon", "MultiPolygon"):
        geom = shape(geojson)
    else:
        raise ValueError(f"Unsupported GeoJSON type: {geojson.get('type')}")

    gdf = gpd.GeoDataFrame(geometry=[geom], crs=f"EPSG:{DEFAULT_EPSG}")

    gdf_metric = gdf.to_crs(epsg=METRIC_EPSG)

    buffer_m = buffer_nm * BUFFER_MULTIPLIER
    buffered_geom = gdf_metric.buffer(distance=buffer_m)

    buffered_wgs84 = gpd.GeoDataFrame(geometry=buffered_geom, crs=f"EPSG:{METRIC_EPSG}")
    buffered_wgs84 = buffered_wgs84.to_crs(epsg=DEFAULT_EPSG)

    buffered_geojson = json.dumps(mapping(buffered_wgs84.geometry.iloc[0]))
    return buffered_geojson
