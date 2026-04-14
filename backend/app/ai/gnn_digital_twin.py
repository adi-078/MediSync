from sqlalchemy import text
import statistics

from .gnn_dataset import build_graph
from .gnn_model import PatientGNN

import torch


def gnn_digital_twin_prediction(db, patient_id):

    data = build_graph(db)

    num_nodes = data.num_nodes
    data.x = torch.eye(num_nodes)

    model = PatientGNN(num_nodes)

    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

    for epoch in range(30):

        optimizer.zero_grad()

        out = model(data.x, data.edge_index)

        loss = out.mean()

        loss.backward()

        optimizer.step()

    # -----------------------------
    # Clinical interpretation
    # -----------------------------

    diagnosis_query = text("""
        SELECT diagnosis
        FROM visits
        WHERE patient_id = :pid
        LIMIT 1
    """)

    diagnosis_result = db.execute(
        diagnosis_query, {"pid": patient_id}
    ).fetchone()

    if not diagnosis_result:
        return {"error": "Patient diagnosis not found"}

    diagnosis = diagnosis_result[0]

    similar_query = text("""
        SELECT DISTINCT patient_id
        FROM visits
        WHERE diagnosis = :diag
        AND patient_id != :pid
    """)

    similar_rows = db.execute(
        similar_query,
        {"diag": diagnosis, "pid": patient_id}
    ).fetchall()

    similar_patients = [r[0] for r in similar_rows][:3]

    if not similar_patients:
        return {"message": "No similar patients found"}

    treatment_query = text("""
        SELECT t.medication
        FROM treatments t
        JOIN visits v ON v.visit_id = t.visit_id
        WHERE v.patient_id = ANY(:pids)
    """)

    treatments = db.execute(
        treatment_query,
        {"pids": similar_patients}
    ).fetchall()

    medications = [t[0] for t in treatments]

    if not medications:
        return {"message": "No treatments found"}

    recommended_med = max(set(medications), key=medications.count)

    outcome_query = text("""
        SELECT to2.effectiveness_score
        FROM trial_outcomes to2
        JOIN trial_enrollments te
        ON te.enrollment_id = to2.enrollment_id
        WHERE te.patient_id = ANY(:pids)
    """)

    outcomes = db.execute(
        outcome_query,
        {"pids": similar_patients}
    ).fetchall()

    scores = [o[0] for o in outcomes if o[0] is not None]

    if not scores:
        return {"message": "No outcome data"}

    predicted_score = statistics.mean(scores)

    risk = "Low"

    if predicted_score < 5:
        risk = "High"
    elif predicted_score < 7:
        risk = "Moderate"

       # Generate explanation reasoning

    reasoning = []

    reasoning.append(
        f"{len(similar_patients)} similar patients with {diagnosis}"
    )

    reasoning.append(
        f"Most common treatment among them: {recommended_med}"
    )

    reasoning.append(
        f"Average clinical trial effectiveness score: {round(predicted_score,2)}"
    )

    if risk == "Low":
        reasoning.append("Low observed adverse outcomes")
    elif risk == "Moderate":
        reasoning.append("Moderate treatment variability observed")
    else:
        reasoning.append("High risk observed in historical cases")


    return {
        "patient_id": patient_id,
        "diagnosis": diagnosis,
        "recommended_treatment": recommended_med,
        "predicted_effectiveness": round(predicted_score, 2),
        "risk_level": risk,
        "explanation": {
            "similar_patients": similar_patients,
            "shared_condition": diagnosis,
            "shared_treatment": recommended_med,
            "average_trial_score": round(predicted_score, 2)
        },
        "clinical_reasoning": reasoning
    }