from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AuditLog
from ..middleware import get_current_user

router = APIRouter()


@router.get("/logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    doctor_id = user.get("doctor_id")

    logs = db.query(AuditLog).filter(
        AuditLog.doctor_id == doctor_id
    ).all()

    return logs