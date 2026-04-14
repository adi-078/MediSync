from sqlalchemy import text


def best_treatment_for_disease(db, disease):

    query = text("""
        SELECT
            t.medication,
            AVG(to2.effectiveness_score) as avg_score,
            COUNT(*) as cases
        FROM treatments t
        JOIN visits v ON v.visit_id = t.visit_id
        JOIN trial_enrollments te ON te.patient_id = v.patient_id
        JOIN trial_outcomes to2 ON to2.enrollment_id = te.enrollment_id
        WHERE v.diagnosis = :disease
        GROUP BY t.medication
        ORDER BY avg_score DESC
        LIMIT 5
    """)

    rows = db.execute(query, {"disease": disease}).fetchall()

    results = []

    for r in rows:
        results.append({
            "medication": r[0],
            "average_effectiveness": round(float(r[1]), 2),
            "cases_analyzed": r[2]
        })

    return {
        "disease": disease,
        "best_treatments": results
    }


def trial_success_rates(db):

    query = text("""
        SELECT
            ct.trial_name,
            AVG(to2.effectiveness_score) as avg_score,
            COUNT(*) as participants
        FROM clinical_trials ct
        JOIN trial_enrollments te
            ON te.trial_id = ct.trial_id
        JOIN trial_outcomes to2
            ON to2.enrollment_id = te.enrollment_id
        GROUP BY ct.trial_name
        ORDER BY avg_score DESC
    """)

    rows = db.execute(query).fetchall()

    results = []

    for r in rows:
        results.append({
            "trial_name": r[0],
            "average_effectiveness": round(float(r[1]), 2),
            "participants": r[2]
        })

    return results