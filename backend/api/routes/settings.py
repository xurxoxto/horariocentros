"""
Endpoints para la configuración del centro (jornada escolar, niveles educativos, etc.)
"""

import json
from fastapi import APIRouter, HTTPException
from uuid import uuid4
from datetime import datetime

from backend.api.schemas import CenterConfigUpdate, CenterConfigResponse, PeriodConfig, BreakConfig
from backend.api.store import store
from backend.persistence.models import CenterConfig
from backend.persistence.database import get_session

router = APIRouter()

# Default periods for "jornada continua" secondary
DEFAULT_PERIODS = [
    {"number": 1, "start_time": "08:30", "end_time": "09:25", "duration_minutes": 55},
    {"number": 2, "start_time": "09:25", "end_time": "10:20", "duration_minutes": 55},
    {"number": 3, "start_time": "10:20", "end_time": "11:15", "duration_minutes": 55},
    {"number": 4, "start_time": "11:45", "end_time": "12:40", "duration_minutes": 55},
    {"number": 5, "start_time": "12:40", "end_time": "13:35", "duration_minutes": 55},
    {"number": 6, "start_time": "13:35", "end_time": "14:30", "duration_minutes": 55},
]

DEFAULT_BREAKS = [
    {"after_period": 3, "start_time": "11:15", "end_time": "11:45", "name": "Recreo"},
]

DEFAULT_EDUCATION_LEVELS = ["infantil", "primaria", "eso", "bachillerato"]


def _get_or_create_config():
    """Get existing config or create default one."""
    session = get_session()
    config = session.query(CenterConfig).first()
    if not config:
        config = CenterConfig(
            id=uuid4(),
            center_name="Mi Centro",
            academic_year="2025-2026",
            schedule_type="continua",
            education_levels=",".join(DEFAULT_EDUCATION_LEVELS),
            periods_per_day=6,
            days_per_week=5,
            total_weekly_hours=30,
            teaching_hours_per_week=25,
            periods_config=json.dumps(DEFAULT_PERIODS),
            breaks_config=json.dumps(DEFAULT_BREAKS),
        )
        session.add(config)
        session.commit()
    return config, session


def _config_to_response(config: CenterConfig) -> CenterConfigResponse:
    """Convert DB config to response schema."""
    periods = json.loads(config.periods_config) if config.periods_config else []
    breaks = json.loads(config.breaks_config) if config.breaks_config else []
    levels = [l.strip() for l in config.education_levels.split(",") if l.strip()]
    
    return CenterConfigResponse(
        id=config.id,
        center_name=config.center_name,
        academic_year=config.academic_year,
        schedule_type=config.schedule_type,
        education_levels=levels,
        periods_per_day=config.periods_per_day,
        days_per_week=config.days_per_week,
        total_weekly_hours=config.total_weekly_hours,
        teaching_hours_per_week=config.teaching_hours_per_week,
        periods=[PeriodConfig(**p) for p in periods],
        breaks=[BreakConfig(**b) for b in breaks],
        created_at=config.created_at or datetime.now(),
    )


@router.get("/center", response_model=CenterConfigResponse)
async def get_center_config():
    """Obtener la configuración del centro."""
    config, _ = _get_or_create_config()
    return _config_to_response(config)


@router.put("/center", response_model=CenterConfigResponse)
async def update_center_config(data: CenterConfigUpdate):
    """Actualizar la configuración del centro."""
    config, session = _get_or_create_config()
    
    try:
        if data.center_name is not None:
            config.center_name = data.center_name
        if data.academic_year is not None:
            config.academic_year = data.academic_year
        if data.schedule_type is not None:
            config.schedule_type = data.schedule_type
        if data.education_levels is not None:
            config.education_levels = ",".join(data.education_levels)
        if data.periods_per_day is not None:
            config.periods_per_day = data.periods_per_day
        if data.days_per_week is not None:
            config.days_per_week = data.days_per_week
        if data.total_weekly_hours is not None:
            config.total_weekly_hours = data.total_weekly_hours
        if data.teaching_hours_per_week is not None:
            config.teaching_hours_per_week = data.teaching_hours_per_week
        if data.periods is not None:
            config.periods_config = json.dumps([p.dict() for p in data.periods])
        if data.breaks is not None:
            config.breaks_config = json.dumps([b.dict() for b in data.breaks])
        
        session.commit()
        return _config_to_response(config)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
