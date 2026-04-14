from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from ..models import Treatment, Visit
from ..middleware import get_current_user

router = APIRouter()


# ============================================
# REQUEST MODEL
# ============================================

class TreatmentCreate(BaseModel):
    visit_id: int
    medication: str
    dosage: str
    duration: str
    treatment_plan: str


# ============================================
# ADD TREATMENT
# ============================================

@router.post("/add-treatment")
def add_treatment(
    treatment: TreatmentCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    visit = db.query(Visit).filter(
        Visit.visit_id == treatment.visit_id
    ).first()

    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    new_treatment = Treatment(
        visit_id=treatment.visit_id,
        medication=treatment.medication,
        dosage=treatment.dosage,
        duration=treatment.duration,
        treatment_plan=treatment.treatment_plan
    )

    db.add(new_treatment)
    db.commit()
    db.refresh(new_treatment)

    return {
        "message": "Treatment added successfully",
        "treatment_id": new_treatment.treatment_id
    }


# ============================================
# GET TREATMENTS
# ============================================

@router.get("/get-treatment/{visit_id}")
def get_treatment(
    visit_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    treatments = db.query(Treatment).filter(
        Treatment.visit_id == visit_id
    ).all()

    return [
        {
            "treatment_id": t.treatment_id,
            "visit_id": t.visit_id,
            "medication": t.medication,
            "dosage": t.dosage,
            "duration": t.duration,
            "treatment_plan": t.treatment_plan
        }
        for t in treatments
    ]