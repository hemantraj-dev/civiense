import random
import logging
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.entities import ActionRecommendation, Zone
from app.schemas.dto import ActionCreate, ActionUpdate

logger = logging.getLogger(__name__)

class ActionService:
    def create_action(self, db: Session, payload: ActionCreate) -> ActionRecommendation:
        rand_id = random.randint(100, 999)
        action_code = f"ACT-2026-{rand_id}"

        action = ActionRecommendation(
            action_code=action_code,
            zone_id=payload.zone_id,
            action_type=payload.action_type,
            description=payload.description,
            priority=payload.priority,
            assigned_team=payload.assigned_team or "MCC Stormwater Rapid Response Team",
            status="Pending Review",
            operator_notes=payload.operator_notes
        )
        db.add(action)
        db.commit()
        db.refresh(action)
        return action

    def update_action(self, db: Session, action_id: int, payload: ActionUpdate) -> Optional[ActionRecommendation]:
        action = db.query(ActionRecommendation).filter(ActionRecommendation.id == action_id).first()
        if not action:
            return None

        if payload.status:
            action.status = payload.status
        if payload.priority:
            action.priority = payload.priority
        if payload.assigned_team:
            action.assigned_team = payload.assigned_team
        if payload.operator_notes:
            action.operator_notes = payload.operator_notes

        action.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(action)
        return action

    def get_all_actions(self, db: Session) -> List[ActionRecommendation]:
        return db.query(ActionRecommendation).order_by(ActionRecommendation.created_at.desc()).all()

    def get_action_by_id(self, db: Session, action_id: int) -> Optional[ActionRecommendation]:
        return db.query(ActionRecommendation).filter(ActionRecommendation.id == action_id).first()

    def seed_demo_actions_if_empty(self, db: Session):
        count = db.query(ActionRecommendation).count()
        if count > 0:
            return

        demo_actions = [
            {
                "code": "ACT-2026-301",
                "zone_code": "CHD-35",
                "type": "Drain cleaning review",
                "desc": "Deploy heavy suction vacuum truck to clear silt and accumulated autumn foliage from Sector 35-C catch-basin line.",
                "pri": "Critical",
                "team": "MCC Stormwater Maintenance Team A",
                "status": "Inspection in Progress",
                "notes": "Truck #CH-01-G-4412 on site. Cleared main junction grate. Proceeding to inner alleys."
            },
            {
                "code": "ACT-2026-302",
                "zone_code": "KHR-SE",
                "type": "Waterlogging site verification",
                "desc": "Check culvert clearance under Kharar-Ludhiana highway junction at Sunny Enclave outfall.",
                "pri": "High",
                "team": "Kharar Civic Works Squad",
                "status": "Assigned",
                "notes": "Team notified. Awaiting heavy pump trailer arrival."
            },
            {
                "code": "ACT-2026-303",
                "zone_code": "ZRK-VIP",
                "type": "Traffic diversion assessment",
                "desc": "Coordinate with Traffic Police to establish warning signage and diversion route if water exceeds 20cm on VIP road.",
                "pri": "High",
                "team": "Zirakpur Municipal Response Wing",
                "status": "Approved",
                "notes": "Traffic advisory drafted. Barricades staged at Savitry Greens crossing."
            },
            {
                "code": "ACT-2026-304",
                "zone_code": "CU-GATE",
                "type": "Drainage inspection",
                "desc": "Inspect stormwater pipe capacity between CU Main Gate culvert and agrarian discharge ditch on NH-5.",
                "pri": "Medium",
                "team": "Gharuan Sub-Divisional Engineering Team",
                "status": "Pending Review",
                "notes": "Triggered by citizen report #CIVI-2026-1054. Scheduled for morning inspection."
            },
            {
                "code": "ACT-2026-305",
                "zone_code": "PKL-19",
                "type": "Preventive maintenance recommendation",
                "desc": "Verify automated submersible sump pumps at Sector 19 railway underpass before evening cloudburst.",
                "pri": "Critical",
                "team": "HSVP / Northern Railway Joint Works Unit",
                "status": "Completed",
                "notes": "Both 50HP dewatering pumps tested successfully on backup diesel generator."
            }
        ]

        for a in demo_actions:
            zone = db.query(Zone).filter(Zone.zone_code == a["zone_code"]).first()
            if zone:
                rec = ActionRecommendation(
                    action_code=a["code"],
                    zone_id=zone.id,
                    action_type=a["type"],
                    description=a["desc"],
                    priority=a["pri"],
                    assigned_team=a["team"],
                    status=a["status"],
                    operator_notes=a["notes"]
                )
                db.add(rec)
        db.commit()
        logger.info("Demo municipal action workflows seeded.")

action_service = ActionService()

