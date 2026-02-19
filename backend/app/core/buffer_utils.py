import geopandas as gpd
from shapely.geometry import mapping, shape

BUFFER_MULTIPLIER = 1852
DEFAULT_EPSG = 4326
METRIC_EPSG = 3006


def buffer_polygon(geojson: dict, buffer_nm: float) -> dict:
    """ "
    Buffer a polygon GeoJSON geometry by a distance in nautical miles.
    Returns the buffered geometry as a GeoJSON string.
    """

    if not geojson:
        raise ValueError("GeoJSON cannot be empty")

    # Convert to shapely
    if geojson["type"] == "Feature":
        geom = shape(geojson["geometry"])
    elif geojson["type"] == "FeatureCollection":
        geom = shape(geojson["features"][0]["geometry"])
    else:
        geom = shape(geojson)

    gdf = gpd.GeoDataFrame(geometry=[geom], crs=f"EPSG:{DEFAULT_EPSG}")

    gdf_metric = gdf.to_crs(epsg=METRIC_EPSG)

    buffer_m = buffer_nm * BUFFER_MULTIPLIER
    buffered_geom = gdf_metric.buffer(distance=buffer_m)

    buffered_wgs84 = gpd.GeoDataFrame(
        geometry=buffered_geom, crs=f"EPSG:{METRIC_EPSG}"
    ).to_crs(epsg=DEFAULT_EPSG)
    return mapping(buffered_wgs84.geometry.iloc[0])
