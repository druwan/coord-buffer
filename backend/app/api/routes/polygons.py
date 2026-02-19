import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from sqlmodel import func, select

from app.api.deps import CurrentUser, ExternalSessionDep, SessionDep
from app.core.buffer_utils import buffer_polygon
from app.models import (
    Message,
    Polygon,
    PolygonCreate,
    PolygonPublic,
    PolygonsPublic,
    PolygonUpdate,
)

router = APIRouter(prefix="/polygons", tags=["polygons"])


@router.get("/", response_model=PolygonsPublic)
def read_polygons(
    *, session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve buffered polygons
    """
    if current_user.is_superuser:
        count = session.exec(select(func.count()).select_from(Polygon)).one()
        statement = select(Polygon).offset(skip).limit(limit)

    else:
        count = session.exec(
            select(func.count())
            .select_from(Polygon)
            .where(Polygon.owner_id == current_user.id)
        ).one()

        statement = (
            select(Polygon)
            .where(Polygon.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
    polygons = session.exec(statement).all()
    polygons_public = [PolygonPublic.model_validate(p) for p in polygons]
    return PolygonsPublic(data=polygons_public, count=count)


@router.get("/{id}", response_model=PolygonPublic)
def read_polygon(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get polygon by ID
    """
    polygon = session.get(Polygon, id)

    if not polygon:
        raise HTTPException(status_code=404, detail="Polygon not found")

    if not current_user.is_superuser and (polygon.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return polygon


@router.post("/", response_model=PolygonPublic)
def create_polygon(
    *,
    session: SessionDep,
    external_session: ExternalSessionDep,
    current_user: CurrentUser,
    polygon_in: PolygonCreate,
) -> Any:
    """
    Creates a buffered polygon from external AIP source.
    """

    statement = text("""
        SELECT
            msid,
            nameofarea,
            positionindicator,
            ST_AsGeoJSON(geom) AS geom
        FROM aip_data
        WHERE msid = :msid
    """)

    result = (
        external_session.execute(statement, {"msid": polygon_in.msid})
        .mappings()
        .first()
    )

    if not result:
        raise HTTPException(status_code=400, detail="AIP polygon not found")

    original_geometry = result["geom"]
    if isinstance(original_geometry, str):
        import json

        original_geometry = json.loads(original_geometry)

    try:
        buffered_geometry = buffer_polygon(original_geometry, polygon_in.buffer_size)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Buffering failed: {e}")

    db_polygon = Polygon.model_validate(
        {
            "title": result.nameofarea,
            "nameofarea": result.nameofarea,
            "positionindicator": result.positionindicator,
            "original_geometry": original_geometry,
            "buffer_size": polygon_in.buffer_size,
            "buffered_geometry": buffered_geometry,
            "owner_id": current_user.id,
        }
    )
    session.add(db_polygon)
    session.commit()
    session.refresh(db_polygon)

    return db_polygon


@router.put("/{id}", response_model=PolygonPublic)
def update_polygon(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    polygon_in: PolygonUpdate,
) -> Any:
    """
    Updates a polygon, i.e. Only buffer_size.
    """
    polygon = session.get(Polygon, id)

    if not polygon:
        raise HTTPException(status_code=404, detail="Polygon not found")

    if not current_user.is_superuser and (polygon.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # If buffer_size or original_geometry changed -> Recompute buffer
    if polygon_in.buffer_size is not None:
        try:
            polygon.buffered_geometry = buffer_polygon(
                polygon.original_geometry, polygon_in.buffer_size
            )
            polygon.buffer_size = polygon_in.buffer_size
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Buffering failed: {e}")

    session.add(polygon)
    session.commit()
    session.refresh(polygon)
    return polygon


@router.delete("/{id}", response_model=Message)
def delete_polygon(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a buffered polygon
    """
    polygon = session.get(Polygon, id)

    if not polygon:
        raise HTTPException(status_code=404, detail="Polygon not found")

    if not current_user.is_superuser and (polygon.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    session.delete(polygon)
    session.commit()
    return Message(message=f"{polygon} deleted successfully")
