import torch
import networkx as nx
from sqlalchemy import text
from torch_geometric.utils import from_networkx


def build_graph(db):

    G = nx.Graph()

    visits = db.execute(text("""
        SELECT patient_id, diagnosis
        FROM visits
    """)).fetchall()

    for v in visits:
        patient = f"patient_{v[0]}"
        diagnosis = f"diagnosis_{v[1]}"

        G.add_node(patient, type="patient")
        G.add_node(diagnosis, type="diagnosis")

        G.add_edge(patient, diagnosis)

    treatments = db.execute(text("""
        SELECT v.patient_id, t.medication
        FROM treatments t
        JOIN visits v ON v.visit_id = t.visit_id
    """)).fetchall()

    for t in treatments:
        patient = f"patient_{t[0]}"
        medication = f"drug_{t[1]}"

        G.add_node(medication, type="drug")
        G.add_edge(patient, medication)

    outcomes = db.execute(text("""
        SELECT te.patient_id, to2.effectiveness_score
        FROM trial_outcomes to2
        JOIN trial_enrollments te
        ON te.enrollment_id = to2.enrollment_id
    """)).fetchall()

    for o in outcomes:
        patient = f"patient_{o[0]}"
        outcome = f"outcome_{o[1]}"

        G.add_node(outcome, type="outcome")
        G.add_edge(patient, outcome)

    data = from_networkx(G)

    return data