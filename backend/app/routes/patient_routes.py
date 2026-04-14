from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from pydantic import BaseModel

from ..database import get_db
from ..models import Patient
from ..middleware import get_current_user

router = APIRouter()


# ============================================
# REQUEST MODEL
# ============================================

class PatientCreate(BaseModel):
    name: str
    dob: date
    gender: str
    contact: str
    medical_history_hash: str


# ============================================
# ADD PATIENT
# ============================================

@router.post("/add-patient")
def add_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    hospital_id = user.get("hospital_id")

    new_patient = Patient(
        name=patient.name,
        dob=patient.dob,
        gender=patient.gender,
        contact=patient.contact,
        medical_history_hash=patient.medical_history_hash,
        hospital_id=hospital_id
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return {
        "message": "Patient added successfully",
        "patient_id": new_patient.patient_id
    }


# ============================================
# GET SINGLE PATIENT
# ============================================

@router.get("/get-patient/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    hospital_id = user.get("hospital_id")

    patient = db.query(Patient).filter(
        Patient.patient_id == patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if patient.hospital_id != hospital_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return {
        "patient_id": patient.patient_id,
        "name": patient.name,
        "dob": patient.dob,
        "gender": patient.gender,
        "contact": patient.contact,
        "medical_history": patient.medical_history_hash
    }


# ============================================
# GET ALL PATIENTS
# ============================================

@router.get("/all-patients")
def get_all_patients(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    hospital_id = user.get("hospital_id")

    patients = db.query(Patient).filter(
        Patient.hospital_id == hospital_id
    ).all()

    return [
        {
            "patient_id": p.patient_id,
            "name": p.name,
            "gender": p.gender,
            "contact": p.contact
        }
        for p in patients
    ]