from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.services.report_service import report_service
from app.schemas.dto import CitizenReportCreate, CitizenReportUpdateStatus, CitizenReportDTO

router = APIRouter(prefix="/reports", tags=["Citizen Waterlogging Reporting"])

@router.post("", status_code=201)
def submit_report(payload: CitizenReportCreate, db: Session = Depends(get_db)):
    """
    Submits a public citizen waterlogging incident report.
    Generates official tracking number and flags proximity duplicate candidates.
    """
    report = report_service.create_report(db, payload)
    return {
        "message": "Waterlogging report submitted successfully. Staged for municipal operator triage.",
        "report_number": report.report_number,
        "id": report.id,
        "is_potential_duplicate": report.is_potential_duplicate,
        "status": report.verification_status,
        "reported_at": report.reported_at.isoformat()
    }

@router.get("")
def list_reports(db: Session = Depends(get_db)):
    """Returns all citizen waterlogging reports for operator review and GIS mapping."""
    reports = report_service.get_all_reports(db)
    return [
        {
            "id": r.id,
            "report_number": r.report_number,
            "zone_id": r.zone_id,
            "location_name": r.location_name,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "description": r.description,
            "reporter_name": r.reporter_name,
            "reporter_contact": r.reporter_contact,
            "severity": r.severity,
            "water_depth_cm": r.water_depth_cm,
            "image_url": r.image_url,
            "verification_status": r.verification_status,
            "operator_notes": r.operator_notes,
            "is_potential_duplicate": r.is_potential_duplicate,
            "reported_at": r.reported_at.isoformat() if r.reported_at else None,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in reports
    ]

@router.get("/{report_id}")
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = report_service.get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Citizen report not found")
    return {
        "id": report.id,
        "report_number": report.report_number,
        "zone_id": report.zone_id,
        "location_name": report.location_name,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "description": report.description,
        "reporter_name": report.reporter_name,
        "reporter_contact": report.reporter_contact,
        "severity": report.severity,
        "water_depth_cm": report.water_depth_cm,
        "image_url": report.image_url,
        "verification_status": report.verification_status,
        "operator_notes": report.operator_notes,
        "is_potential_duplicate": report.is_potential_duplicate,
        "reported_at": report.reported_at.isoformat() if report.reported_at else None
    }

@router.patch("/{report_id}/status")
def update_report_status(report_id: int, payload: CitizenReportUpdateStatus, db: Session = Depends(get_db)):
    """
    Operator status triage: Submitted -> Under Review -> Verified -> Rejected -> Resolved.
    Never marks verified until an authorized operator confirms.
    """
    report = report_service.update_status(db, report_id, payload.verification_status, payload.operator_notes)
    if not report:
        raise HTTPException(status_code=404, detail="Citizen report not found")
    return {
        "message": f"Report status updated to '{report.verification_status}'",
        "id": report.id,
        "report_number": report.report_number,
        "verification_status": report.verification_status,
        "operator_notes": report.operator_notes
    }

