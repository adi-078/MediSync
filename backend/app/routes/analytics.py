from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..database import get_db

router = APIRouter()


# --------------------------------
# SUMMARY METRICS
# --------------------------------
@router.get("/summary")
def analytics_summary(db: Session = Depends(get_db)):

    hospitals = db.execute(text("SELECT COUNT(*) FROM hospitals")).scalar()
    doctors = db.execute(text("SELECT COUNT(*) FROM doctors")).scalar()
    patients = db.execute(text("SELECT COUNT(*) FROM patients")).scalar()
    visits = db.execute(text("SELECT COUNT(*) FROM visits")).scalar()
    treatments = db.execute(text("SELECT COUNT(*) FROM treatments")).scalar()
    trials = db.execute(text("SELECT COUNT(*) FROM trials")).scalar()
    enrollments = db.execute(text("SELECT COUNT(*) FROM trial_enrollments")).scalar()
    outcomes = db.execute(text("SELECT COUNT(*) FROM trial_outcomes")).scalar()

    return {
        "hospitals": hospitals,
        "doctors": doctors,
        "patients": patients,
        "visits": visits,
        "treatments": treatments,
        "clinical_trials": trials,
        "trial_enrollments": enrollments,
        "trial_outcomes": outcomes
    }


# --------------------------------
# TRIAL OUTCOME DISTRIBUTION
# --------------------------------
@router.get("/trial-success")
def trial_success(db: Session = Depends(get_db)):

    results = db.execute(text("""
        SELECT result, COUNT(*) as count
        FROM trial_outcomes
        GROUP BY result
    """)).fetchall()

    data = []

    for r in results:
        data.append({
            "result": r[0],
            "count": r[1]
        })

    return data


# --------------------------------
# TOP DIAGNOSIS
# --------------------------------
@router.get("/top-diagnosis")
def top_diagnosis(db: Session = Depends(get_db)):

    results = db.execute(text("""
        SELECT diagnosis, COUNT(*) as count
        FROM visits
        GROUP BY diagnosis
        ORDER BY count DESC
        LIMIT 5
    """)).fetchall()

    data = []

    for r in results:
        data.append({
            "diagnosis": r[0],
            "count": r[1]
        })

    return data