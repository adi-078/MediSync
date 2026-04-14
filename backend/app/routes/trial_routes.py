from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ClinicalTrial, TrialEnrollment
from ..middleware import get_current_user
from ..models import TrialOutcome
router = APIRouter()


# List all clinical trials
@router.get("/list")
def list_trials(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    trials = db.query(ClinicalTrial).all()
    return trials


# Enroll patient in a trial
@router.post("/enroll")
def enroll_patient(
    trial_id: int,
    patient_id: int,
    status: str = "Enrolled",
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    doctor_id = user.get("doctor_id")

    # Check if trial exists
    trial = db.query(ClinicalTrial).filter(
        ClinicalTrial.trial_id == trial_id
    ).first()

    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")

    enrollment = TrialEnrollment(
        trial_id=trial_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        status=status
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return {
        "message": "Patient enrolled successfully",
        "enrollment_id": enrollment.enrollment_id
    }
# Record trial outcome
@router.post("/record-outcome")
def record_outcome(
    enrollment_id: int,
    result: str,
    side_effects: str,
    effectiveness_score: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    outcome = TrialOutcome(
        enrollment_id=enrollment_id,
        result=result,
        side_effects=side_effects,
        effectiveness_score=effectiveness_score
    )

    db.add(outcome)
    db.commit()
    db.refresh(outcome)

    return {
        "message": "Trial outcome recorded successfully",
        "outcome_id": outcome.outcome_id
    }


# Get outcomes for an enrollment
@router.get("/outcomes/{enrollment_id}")
def get_outcomes(
    enrollment_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    outcomes = db.query(TrialOutcome).filter(
        TrialOutcome.enrollment_id == enrollment_id
    ).all()

    return outcomes
@router.get("/enrollments/{trial_id}")
def get_enrollments(
    trial_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    enrollments = db.query(TrialEnrollment).filter(
        TrialEnrollment.trial_id == trial_id
    ).all()

    return enrollments
@router.get("/all-enrollments")
def get_all_enrollments(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):

    enrollments = db.query(TrialEnrollment).all()

    return enrollments