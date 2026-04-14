import networkx as nx
from sqlalchemy.orm import Session
from ..models import Patient, Visit, Treatment, TrialEnrollment, TrialOutcome


def build_patient_graph(db: Session):

    G = nx.Graph()

    patients = db.query(Patient).all()

    for patient in patients:

        patient_node = f"patient_{patient.patient_id}"
        G.add_node(patient_node, type="patient")

        visits = db.query(Visit).filter(
            Visit.patient_id == patient.patient_id
        ).all()

        for visit in visits:

            visit_node = f"visit_{visit.visit_id}"
            G.add_node(visit_node, type="visit")

            G.add_edge(patient_node, visit_node)

            treatments = db.query(Treatment).filter(
                Treatment.visit_id == visit.visit_id
            ).all()

            for treatment in treatments:

                treatment_node = f"treatment_{treatment.treatment_id}"

                G.add_node(
                    treatment_node,
                    type="treatment",
                    medication=treatment.medication
                )

                G.add_edge(visit_node, treatment_node)

        enrollments = db.query(TrialEnrollment).filter(
            TrialEnrollment.patient_id == patient.patient_id
        ).all()

        for enrollment in enrollments:

            enrollment_node = f"enrollment_{enrollment.enrollment_id}"
            G.add_node(enrollment_node, type="trial_enrollment")

            G.add_edge(patient_node, enrollment_node)

            outcomes = db.query(TrialOutcome).filter(
                TrialOutcome.enrollment_id == enrollment.enrollment_id
            ).all()

            for outcome in outcomes:

                outcome_node = f"outcome_{outcome.outcome_id}"

                G.add_node(
                    outcome_node,
                    type="outcome",
                    result=outcome.result
                )

                G.add_edge(enrollment_node, outcome_node)

    return G
def get_patient_connections(graph, patient_id):

    node = f"patient_{patient_id}"

    if node not in graph:
        return []

    neighbors = list(graph.neighbors(node))

    return neighbors