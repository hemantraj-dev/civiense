from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.action_service import action_service
from app.models.entities import ActionRecommendation, Zone
from app.schemas.dto import ActionCreate, ActionUpdate

router = APIRouter(prefix="/actions", tags=["Action & Inspection Management"])

@router.post("", status_code=201)
def create_action(payload: ActionCreate, db: Session = Depends(get_db)):
    """
    Creates a municipal inspection or preventive action work order.
    Disclosed: Prototype operational simulation.
    """
    action = action_service.create_action(db, payload)
    return {
        "message": "Action work order created successfully.",
        "id": action.id,
        "action_code": action.action_code,
        "status": action.status,
        "priority": action.priority,
        "assigned_team": action.assigned_team
    }

@router.get("")
def list_actions(db: Session = Depends(get_db)):
    actions = action_service.get_all_actions(db)
    results = []
    for a in actions:
        zone_name = a.zone.zone_name if a.zone else "Regional General"
        zone_code = a.zone.zone_code if a.zone else "REG-ALL"
        results.append({
            "id": a.id,
            "action_code": a.action_code,
            "zone_id": a.zone_id,
            "zone_code": zone_code,
            "zone_name": zone_name,
            "action_type": a.action_type,
            "description": a.description,
            "priority": a.priority,
            "assigned_team": a.assigned_team,
            "status": a.status,
            "operator_notes": a.operator_notes,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "updated_at": a.updated_at.isoformat() if a.updated_at else None
        })
    return results

@router.get("/{action_id}")
def get_action(action_id: int, db: Session = Depends(get_db)):
    a = action_service.get_action_by_id(db, action_id)
    if not a:
        raise HTTPException(status_code=404, detail="Action work order not found")
    return {
        "id": a.id,
        "action_code": a.action_code,
        "zone_id": a.zone_id,
        "zone_code": a.zone.zone_code if a.zone else "REG-ALL",
        "zone_name": a.zone.zone_name if a.zone else "Regional General",
        "action_type": a.action_type,
        "description": a.description,
        "priority": a.priority,
        "assigned_team": a.assigned_team,
        "status": a.status,
        "operator_notes": a.operator_notes,
        "created_at": a.created_at.isoformat() if a.created_at else None,
        "updated_at": a.updated_at.isoformat() if a.updated_at else None
    }

@router.patch("/{action_id}")
def update_action(action_id: int, payload: ActionUpdate, db: Session = Depends(get_db)):
    a = action_service.update_action(db, action_id, payload)
    if not a:
        raise HTTPException(status_code=404, detail="Action work order not found")
    return {
        "message": f"Action status updated to '{a.status}'",
        "id": a.id,
        "action_code": a.action_code,
        "status": a.status,
        "priority": a.priority,
        "assigned_team": a.assigned_team,
        "operator_notes": a.operator_notes
    }

