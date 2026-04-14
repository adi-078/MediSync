from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..database import get_db
from ..ai.graph_embeddings import generate_embeddings, find_similar_patients
from ..ai.trial_matching import recommend_trials
from ..ai.gnn_digital_twin import gnn_digital_twin_prediction
from ..ai.knowledge_queries import best_treatment_for_disease, trial_success_rates
from ..ai.risk_predictor import calculate_risk

router = APIRouter()


# -------------------------------
# Patient Similarity Endpoint
# -------------------------------
@router.get("/similar-patients/{patient_id}")
def similar_patients(patient_id: int, db: Session = Depends(get_db)):

    embeddings = generate_embeddings(db)

    if f"patient_{patient_id}" not in embeddings:
        raise HTTPException(status_code=404, detail="Patient not found")

    similar = find_similar_patients(patient_id, embeddings)

    results = []

    for patient_node, score in similar:

        pid = int(patient_node.split("_")[1])

        # Get diagnosis
        diagnosis = db.execute(text("""
            SELECT diagnosis
            FROM visits
            WHERE patient_id = :pid
            LIMIT 1
        """), {"pid": pid}).fetchone()

        # Get treatment
        treatment = db.execute(text("""
            SELECT medication
            FROM treatments t
            JOIN visits v ON v.visit_id = t.visit_id
            WHERE v.patient_id = :pid
            LIMIT 1
        """), {"pid": pid}).fetchone()

        results.append({
            "patient": patient_node,
            "similarity": float(score),
            "shared_condition": diagnosis[0] if diagnosis else None,
            "shared_treatment": treatment[0] if treatment else None
        })

    return {
        "patient_id": patient_id,
        "similar_patients": results
    }


# -----------------------------------
# Adaptive Clinical Trial Matching
# -----------------------------------
@router.get("/recommend-trials/{patient_id}")
def trial_recommendations(patient_id: int, db: Session = Depends(get_db)):

    # Check patient exists
    patient = db.execute(text("""
        SELECT patient_id FROM patients
        WHERE patient_id = :pid
    """), {"pid": patient_id}).fetchone()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    recommendations = recommend_trials(patient_id, db)

    if not recommendations:
        return {
            "patient_id": patient_id,
            "message": "No suitable trials found"
        }

    return {
        "patient_id": patient_id,
        "recommended_trials": recommendations
    }
@router.get("/gnn-digital-twin/{patient_id}")
def gnn_digital_twin(patient_id: int, db: Session = Depends(get_db)):

    result = gnn_digital_twin_prediction(db, patient_id)

    return result
@router.get("/research/best-treatment")
def research_best_treatment(disease: str, db: Session = Depends(get_db)):

    result = best_treatment_for_disease(db, disease)

    return result


@router.get("/research/trial-success")
def research_trial_success(db: Session = Depends(get_db)):

    result = trial_success_rates(db)

    return {
        "clinical_trial_performance": result
    }

@router.get("/risk-score/{patient_id}")
def patient_risk_score(patient_id: int, db: Session = Depends(get_db)):

    result = calculate_risk(db, patient_id)

    return result