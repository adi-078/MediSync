from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import Visit, Patient
from ..middleware import get_current_user
from ..encryption import encrypt_text, decrypt_text
from ..utils.audit import log_action

router = APIRouter()


# ============================================
# REQUEST MODEL (JSON BODY)
# ============================================

class VisitCreate(BaseModel):
    patient_id: int
    diagnosis: str
    symptoms: str


# ============================================
# ADD VISIT (Encrypted + Logged)
# ============================================

@router.post("/add-visit")
def add_visit(
    visit: VisitCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    doctor_id = user.get("doctor_id")
    hospital_id = user.get("hospital_id")

    # Check if patient exists
    patient = db.query(Patient).filter(
        Patient.patient_id == visit.patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Hospital isolation
    if patient.hospital_id != hospital_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Encrypt medical data
    encrypted_diagnosis = encrypt_text(visit.diagnosis)
    encrypted_symptoms = encrypt_text(visit.symptoms)

    new_visit = Visit(
        patient_id=visit.patient_id,
        doctor_id=doctor_id,
        diagnosis=encrypted_diagnosis,
        symptoms=encrypted_symptoms
    )

    db.add(new_visit)
    db.commit()
    db.refresh(new_visit)

    # Log visit creation
    log_action(db, doctor_id, visit.patient_id, "Added Visit")

    return {
        "message": "Visit securely stored",
        "visit_id": new_visit.visit_id
    }


# ============================================
# GET VISITS (Decrypted + Logged)
# ============================================

@router.get("/get-visit/{patient_id}")
def get_visits(
    patient_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    doctor_id = user.get("doctor_id")
    hospital_id = user.get("hospital_id")

    # Check if patient exists
    patient = db.query(Patient).filter(
        Patient.patient_id == patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Hospital isolation
    if patient.hospital_id != hospital_id:
        raise HTTPException(status_code=403, detail="Access denied")

    visits = db.query(Visit).filter(
        Visit.patient_id == patient_id
    ).order_by(Visit.visit_date.desc()).all()

    # Log visit viewing
    log_action(db, doctor_id, patient_id, "Viewed Patient Visits")

    # Safe decrypt helper (handles old plaintext data)
    def safe_decrypt(value):
        try:
            return decrypt_text(value)
        except:
            return value

    return [
        {
            "visit_id": v.visit_id,
            "visit_date": v.visit_date,
            "diagnosis": safe_decrypt(v.diagnosis),
            "symptoms": safe_decrypt(v.symptoms)
        }
        for v in visits
    ]
@router.get("/all-visits")
def get_all_visits(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    visits = db.query(Visit).all()

    return visits