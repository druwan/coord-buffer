import uuid
from typing import Any
from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Message,
    Polygon,
    PolygonCreate,
    PolygonPublic,
    PolygonsPublic,
    PolygonUpdate,
)
from app.core.buffer_utils import (
    buffer_polygon,
)

router = APIRouter(prefix="/polygons", tags=["polygons"])


@router.get("/", response_model=PolygonsPublic)
def read_polygons(
    *, session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve polygons
    TODO: Retrieve from aip_data
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Polygon)
        count = session.exec(count_statement).one()
        statement = select(Polygon).offset(skip).limit(limit)
        polygons = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Polygon)
            .where(Polygon.owner_id == current_user.id)
        )
        statement = (
            select(Polygon)
            .where(Polygon.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        polygons = session.exec(statement).all()
    return PolygonsPublic(data=polygons, count=count)


@router.get("/{id}", response_model=PolygonPublic)
def read_polygon(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get polygon by ID
    """
    polygon = session.get(Polygon, id)
    if not polygon:
        raise HTTPException(status_code=404, detail="Polygon not found")
    if not current_user.is_superuser and (polygon.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return polygon


@router.post("/", response_model=PolygonPublic)
def create_polygon(
    *, session: SessionDep, current_user: CurrentUser, polygon_in: PolygonCreate
) -> Any:
    """
    Store a buffered polygon
    """
    original_geometry = polygon_in.coordinates
    buffered_geometry = original_geometry

    if polygon_in.buffer_size and polygon_in.buffer_size > 0:
        try:
            buffered_geometry = buffer_polygon(
                original_geometry, polygon_in.buffer_size
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Buffering failed: {e}")

    db_polygon = Polygon.model_validate(
        {
            "title": polygon_in.title,
            "owner_id": current_user.id,
            "buffer_size": polygon_in.buffer_size,
            "positionindicator": polygon_in.positionindicator,
        }
    )
    session.add(db_polygon)
    session.commit()
    session.refresh(db_polygon)

    return {
        **db_polygon.dict(),
        "original_geometry": original_geometry,
        "buffered_geometry": buffered_geometry,
    }


@router.put("/{id}", response_model=PolygonPublic)
def update_polygon(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    polygon_in: PolygonUpdate,
) -> Any:
    """
    Update a polygon
    """
    polygon = session.get(Polygon, id)
    if not polygon:
        raise HTTPException(status_code=404, detail="Polygon not found")
    if not current_user.is_superuser and (polygon.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = polygon_in.model_dump(exclude_unset=True)
    polygon.sqlmodel_update(update_dict)
    session.add(polygon)
    session.commit()
    session.refresh(polygon)
    return polygon


@router.delete("/{id}")
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
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(polygon)
    session.commit()
    return Message(message=f"{polygon} deleted successfully")
