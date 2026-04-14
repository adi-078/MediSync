from sqlalchemy import text
from .graph_embeddings import generate_embeddings, find_similar_patients


def recommend_trials(patient_id, db):

    embeddings = generate_embeddings(db)

    similar_patients = find_similar_patients(patient_id, embeddings)

    trial_scores = {}

    for patient_node, similarity in similar_patients:

        pid = int(patient_node.split("_")[1])

        outcomes = db.execute(text("""
            SELECT ct.trial_id, ct.trial_name, o.effectiveness_score
            FROM trial_outcomes o
            JOIN trial_enrollments e ON o.enrollment_id = e.enrollment_id
            JOIN clinical_trials ct ON ct.trial_id = e.trial_id
            WHERE e.patient_id = :pid
        """), {"pid": pid}).fetchall()

        for trial_id, trial_name, score in outcomes:

            if trial_id not in trial_scores:
                trial_scores[trial_id] = {
                    "trial_name": trial_name,
                    "scores": []
                }

            trial_scores[trial_id]["scores"].append(score)

    recommendations = []

    for trial_id, data in trial_scores.items():

        avg_score = sum(data["scores"]) / len(data["scores"])

        recommendations.append({
            "trial_id": trial_id,
            "trial_name": data["trial_name"],
            "predicted_success_score": round(avg_score, 2)
        })

    recommendations.sort(
        key=lambda x: x["predicted_success_score"],
        reverse=True
    )

    return recommendations