import json
from typing import Any

from fastapi import APIRouter
from sqlalchemy import text

from app.api.deps import ExternalSessionDep
from app.models import AipPolygonRead

router = APIRouter(prefix="/aip", tags=["aip"])


@router.get("/", response_model=list[AipPolygonRead])
def read_external_aip_polygons(
    *, session: ExternalSessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve polygons from aip_data
    """

    statement = text("""
        SELECT
            msid,
            nameofarea,
            positionindicator,
            ST_AsGeoJSON(geom) AS geom
        FROM aip_data
        WHERE typeofarea = 'TMAW'
        ORDER BY nameofarea COLLATE "sv-SE-x-icu"
        OFFSET :skip
        LIMIT :limit
    """)

    result = session.execute(statement, {"skip": skip, "limit": limit}).all()

    polygons = [
        AipPolygonRead(
            msid=row.msid,
            nameofarea=row.nameofarea,
            positionindicator=row.positionindicator,
            geom=json.loads(row.geom) if row.geom else None,
        )
        for row in result
    ]
    return polygons
