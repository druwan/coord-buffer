import json
from typing import Any

from fastapi import APIRouter
from sqlalchemy import collate, func
from sqlmodel import select

from app.api.deps import ExternalSessionDep
from app.models import ExternalPolygons, ExternalPolygonsGeoJSON

router = APIRouter(prefix="/aip-polygons", tags=["aip-polygons"])


@router.get("/", response_model=list[ExternalPolygonsGeoJSON])
def read_external_polygons(
    *, session: ExternalSessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve polygons from aip_data
    """
    statement = (
        select(
            ExternalPolygons.msid,
            ExternalPolygons.nameofarea,
            ExternalPolygons.positionindicator,
            func.ST_AsGeoJSON(ExternalPolygons.geom).label("geom"),
        )
        .where(ExternalPolygons.typeofarea == "TMAW")
        .order_by(collate(ExternalPolygons.nameofarea, "sv-SE-x-icu"))  # type: ignore
        .offset(skip)
        .limit(limit)
    )
    result = session.exec(statement).all()
    polygons = [
        ExternalPolygonsGeoJSON(
            msid=row[0],
            nameofarea=row[1],
            positionindicator=row[2],
            geom=json.loads(row[3]),
        )
        for row in result
    ]
    return polygons
