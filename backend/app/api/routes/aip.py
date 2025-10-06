from typing import Any, List

from fastapi import APIRouter
from sqlmodel import select

from app.api.deps import ExternalSessionDep
from app.models import ExternalPolygons

router = APIRouter(prefix="/aip-polygons", tags=["aip-polygons"])


@router.get("/", response_model=List[ExternalPolygons])
def read_external_polygons(
    *, session: ExternalSessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve polygons from aip_data
    """
    statement = select(ExternalPolygons).offset(skip).limit(limit)
    polygons = session.exec(statement).all()
    return polygons
