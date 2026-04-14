from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    Hospital,
    Doctor,
    Patient,
    Visit,
    Treatment,
    ClinicalTrial,
    TrialEnrollment,
    TrialOutcome
)

router = APIRouter()


@router.get("/summary")
def analytics_summary(db: Session = Depends(get_db)):

    total_hospitals = db.query(Hospital).count()
    total_doctors = db.query(Doctor).count()
    total_patients = db.query(Patient).count()
    total_visits = db.query(Visit).count()
    total_treatments = db.query(Treatment).count()

    total_trials = db.query(ClinicalTrial).count()
    total_enrollments = db.query(TrialEnrollment).count()
    total_outcomes = db.query(TrialOutcome).count()

    return {
        "hospitals": total_hospitals,
        "doctors": total_doctors,
        "patients": total_patients,
        "visits": total_visits,
        "treatments": total_treatments,
        "clinical_trials": total_trials,
        "trial_enrollments": total_enrollments,
        "trial_outcomes": total_outcomes
    }