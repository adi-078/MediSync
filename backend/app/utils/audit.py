from sqlalchemy.orm import Session
from ..models import AuditLog


def log_action(db: Session, doctor_id: int, patient_id: int, action: str):
    log = AuditLog(
        doctor_id=doctor_id,
        patient_id=patient_id,
        action=action
    )

    db.add(log)
    db.commit()