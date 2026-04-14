from sqlalchemy import text
import statistics


def calculate_risk(db, patient_id):

    # Get diagnosis
    diagnosis_query = text("""
        SELECT diagnosis
        FROM visits
        WHERE patient_id = :pid
        LIMIT 1
    """)

    result = db.execute(diagnosis_query, {"pid": patient_id}).fetchone()

    if not result:
        return {"error": "Patient not found"}

    diagnosis = result[0]

    # Get effectiveness scores
    scores_query = text("""
        SELECT to2.effectiveness_score
        FROM trial_outcomes to2
        JOIN trial_enrollments te
        ON te.enrollment_id = to2.enrollment_id
        WHERE te.patient_id = :pid
    """)

    score_rows = db.execute(scores_query, {"pid": patient_id}).fetchall()

    scores = [r[0] for r in score_rows if r[0] is not None]

    # Get adverse reactions
    side_query = text("""
        SELECT side_effects
        FROM trial_outcomes to2
        JOIN trial_enrollments te
        ON te.enrollment_id = to2.enrollment_id
        WHERE te.patient_id = :pid
        AND to2.result = 'Adverse Reaction'
    """)

    side_rows = db.execute(side_query, {"pid": patient_id}).fetchall()

    adverse_count = len(side_rows)

    if not scores:
        return {
            "patient_id": patient_id,
            "diagnosis": diagnosis,
            "risk_score": None,
            "risk_level": "Unknown"
        }

    avg_effectiveness = statistics.mean(scores)

    # Risk calculation
    risk_score = 1 - (avg_effectiveness / 10)

    if adverse_count > 0:
        risk_score += 0.2

    risk_score = min(max(risk_score, 0), 1)

    # Risk level
    if risk_score < 0.4:
        risk_level = "Low"
    elif risk_score < 0.7:
        risk_level = "Moderate"
    else:
        risk_level = "High"

    # Key factors explanation
    factors = []

    if avg_effectiveness > 7:
        factors.append("High treatment effectiveness")
    elif avg_effectiveness > 5:
        factors.append("Moderate treatment effectiveness")
    else:
        factors.append("Low treatment effectiveness")

    if adverse_count > 0:
        factors.append("Observed adverse reactions")

    return {
        "patient_id": patient_id,
        "diagnosis": diagnosis,
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "key_factors": factors
    }