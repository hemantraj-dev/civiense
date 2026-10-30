import math
import random
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.entities import CitizenReport, Zone
from app.schemas.dto import CitizenReportCreate

logger = logging.getLogger(__name__)

class ReportService:
    def create_report(self, db: Session, payload: CitizenReportCreate) -> CitizenReport:
        # Generate formal report number
        rand_suffix = random.randint(1000, 9999)
        report_num = f"CIVI-2026-{rand_suffix}"

        # Match to nearest zone
        nearest_zone = self._find_nearest_zone(db, payload.latitude, payload.longitude)
        
        # Check potential duplicate using spatial proximity (< 250m) and temporal proximity (< 12 hours)
        is_dup = self._check_duplicate(db, payload.latitude, payload.longitude)

        report = CitizenReport(
            report_number=report_num,
            zone_id=nearest_zone.id if nearest_zone else None,
            location_name=payload.location_name,
            latitude=payload.latitude,
            longitude=payload.longitude,
            description=payload.description,
            reporter_name=payload.reporter_name or "Anonymous Citizen",
            reporter_contact=payload.reporter_contact,
            severity=payload.severity,
            water_depth_cm=payload.water_depth_cm,
            image_url=payload.image_url,
            verification_status="Submitted",
            is_potential_duplicate=is_dup,
            reported_at=datetime.utcnow()
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    def update_status(self, db: Session, report_id: int, new_status: str, operator_notes: Optional[str] = None) -> Optional[CitizenReport]:
        report = db.query(CitizenReport).filter(CitizenReport.id == report_id).first()
        if not report:
            return None

        report.verification_status = new_status
        if operator_notes:
            report.operator_notes = operator_notes
        db.commit()
        db.refresh(report)
        return report

    def get_all_reports(self, db: Session) -> List[CitizenReport]:
        return db.query(CitizenReport).order_by(CitizenReport.reported_at.desc()).all()

    def get_report_by_id(self, db: Session, report_id: int) -> Optional[CitizenReport]:
        return db.query(CitizenReport).filter(CitizenReport.id == report_id).first()

    def _find_nearest_zone(self, db: Session, lat: float, lon: float) -> Optional[Zone]:
        zones = db.query(Zone).all()
        if not zones:
            return None
        min_dist = float("inf")
        nearest = None
        for z in zones:
            d = (z.representative_latitude - lat)**2 + (z.representative_longitude - lon)**2
            if d < min_dist:
                min_dist = d
                nearest = z
        return nearest

    def _check_duplicate(self, db: Session, lat: float, lon: float, threshold_meters: float = 250.0) -> bool:
        """
        Duplicate review signal: flags reports logged within 250m and within the past 12 hours.
        Honest design: Does not auto-reject, simply flags for operator review.
        """
        recent_cutoff = datetime.utcnow() - timedelta(hours=12)
        recents = db.query(CitizenReport).filter(CitizenReport.reported_at >= recent_cutoff).all()

        for r in recents:
            # Distance in metres approximate
            dlat = (r.latitude - lat) * 111000
            dlon = (r.longitude - lon) * 96000
            dist = math.sqrt(dlat**2 + dlon**2)
            if dist <= threshold_meters:
                return True
        return False

    def seed_demo_reports_if_empty(self, db: Session):
        count = db.query(CitizenReport).count()
        if count > 0:
            return

        demo_reports = [
            {
                "num": "CIVI-2026-1042",
                "code": "CHD-35",
                "loc": "Sector 35-C Inner Market Parking (Near Pedestrian Underpass)",
                "lat": 30.7230,
                "lon": 76.7580,
                "desc": "Severe water accumulation up to knee level in parking bay. Storm grate clogged with leaves.",
                "reporter": "Sunita Sharma (Shop Owner)",
                "contact": "+91 98765 43210",
                "sev": "Severe",
                "depth": 35.0,
                "status": "Verified",
                "notes": "Verified by Field Inspector Vikram Singh. Silt suction unit dispatched.",
                "is_dup": False
            },
            {
                "num": "CIVI-2026-1045",
                "code": "KHR-SE",
                "loc": "Sunny Enclave Sector 125 Main Commercial Road (Chajju Majra Turn)",
                "lat": 30.7350,
                "lon": 76.6620,
                "desc": "Road completely waterlogged after 30 minutes of rain. Two vehicles stranded in culvert dip.",
                "reporter": "Gurpreet Singh (Local Resident)",
                "contact": "+91 98141 22334",
                "sev": "High",
                "depth": 28.0,
                "status": "Verified",
                "notes": "Verified. Pump deployed to prevent shop inundation.",
                "is_dup": False
            },
            {
                "num": "CIVI-2026-1051",
                "code": "ZRK-VIP",
                "loc": "Zirakpur VIP Road (Near Savitry Greens Crossing)",
                "lat": 30.6420,
                "lon": 76.8180,
                "desc": "Water sheet flow 8 inches deep spilling from highway drainage onto market service lane.",
                "reporter": "Amit Roy (Commuter)",
                "contact": "+91 99880 11223",
                "sev": "High",
                "depth": 20.0,
                "status": "Under Review",
                "notes": "Assigned to Zirakpur Municipal Council Storm Crew for cross-verification.",
                "is_dup": False
            },
            {
                "num": "CIVI-2026-1054",
                "code": "CU-GATE",
                "loc": "Chandigarh University (CU) Main Gate NH-5 Service Cut",
                "lat": 30.7710,
                "lon": 76.5760,
                "desc": "Puddle depth 15cm at main pedestrian crossing impeding university students entering campus.",
                "reporter": "Rahul Verma (CU Student Council)",
                "contact": "+91 97790 55667",
                "sev": "Medium",
                "depth": 15.0,
                "status": "Submitted",
                "notes": "New report received via public portal. Awaiting operator triage.",
                "is_dup": False
            },
            {
                "num": "CIVI-2026-1058",
                "code": "SAS-3B2",
                "loc": "Mohali Phase 3B2 Booths Line (Behind Food Plaza)",
                "lat": 30.7180,
                "lon": 76.7210,
                "desc": "Localized pooling behind restaurants due to blocked grease trap outfall.",
                "reporter": "Manpreet Kaur (Resident)",
                "contact": "+91 98888 77665",
                "sev": "Medium",
                "depth": 12.0,
                "status": "Submitted",
                "notes": "Duplicate review flag triggered (proximity match with nearby report).",
                "is_dup": True
            }
        ]

        for r in demo_reports:
            zone = db.query(Zone).filter(Zone.zone_code == r["code"]).first()
            new_r = CitizenReport(
                report_number=r["num"],
                zone_id=zone.id if zone else None,
                location_name=r["loc"],
                latitude=r["lat"],
                longitude=r["lon"],
                description=r["desc"],
                reporter_name=r["reporter"],
                reporter_contact=r["contact"],
                severity=r["sev"],
                water_depth_cm=r["depth"],
                verification_status=r["status"],
                operator_notes=r["notes"],
                is_potential_duplicate=r["is_dup"],
                reported_at=datetime.utcnow() - timedelta(hours=random.randint(1, 18))
            )
            db.add(new_r)
        db.commit()
        logger.info("Demo citizen reports seeded with clear simulation metadata.")

report_service = ReportService()

