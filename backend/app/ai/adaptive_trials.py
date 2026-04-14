from sqlalchemy import text


def recommend_trials(db, patient_id):

    # Step 1 — Get patient diagnosis
    diagnosis_query = text("""
        SELECT diagnosis
        FROM visits
        WHERE patient_id = :pid
        LIMIT 1
    """)

    result = db.execute(diagnosis_query, {"pid": patient_id}).fetchone()

    if not result:
        return []

    diagnosis = result[0]

    # Step 2 — Find similar patients
    similar_query = text("""
        SELECT DISTINCT patient_id
        FROM visits
        WHERE diagnosis = :diag
        AND patient_id != :pid
    """)

    similar_patients = db.execute(
        similar_query,
        {"diag": diagnosis, "pid": patient_id}
    ).fetchall()

    patient_ids = [p[0] for p in similar_patients]

    if not patient_ids:
        return []

    # Step 3 — Trial success analysis
    trial_query = text("""
        SELECT
            ct.trial_id,
            ct.trial_name,
            AVG(to2.effectiveness_score) as avg_score
        FROM trial_enrollments te
        JOIN trial_outcomes to2
            ON te.enrollment_id = to2.enrollment_id
        JOIN clinical_trials ct
            ON ct.trial_id = te.trial_id
        WHERE te.patient_id = ANY(:patients)
        GROUP BY ct.trial_id, ct.trial_name
        ORDER BY avg_score DESC
        LIMIT 5
    """)

    trials = db.execute(
        trial_query,
        {"patients": patient_ids}
    ).fetchall()

    recommendations = []

    for t in trials:
        recommendations.append({
            "trial_id": t[0],
            "trial_name": t[1],
            "predicted_success_score": float(t[2])
        })

    return {
        "patient_id": patient_id,
        "diagnosis": diagnosis,
        "recommended_trials": recommendations
    }