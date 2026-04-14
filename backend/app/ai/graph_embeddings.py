import networkx as nx
import numpy as np
from node2vec import Node2Vec
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import text


# -------------------------
# Build Graph From Database
# -------------------------
def build_graph(db):

    G = nx.Graph()

    visits = db.execute(text("""
        SELECT patient_id, diagnosis
        FROM visits
    """)).fetchall()

    for patient_id, diagnosis in visits:
        patient_node = f"patient_{patient_id}"
        diagnosis_node = f"diagnosis_{diagnosis}"

        G.add_node(patient_node)
        G.add_node(diagnosis_node)

        G.add_edge(patient_node, diagnosis_node)

    treatments = db.execute(text("""
        SELECT v.patient_id, t.medication
        FROM treatments t
        JOIN visits v ON v.visit_id = t.visit_id
    """)).fetchall()

    for patient_id, medication in treatments:
        patient_node = f"patient_{patient_id}"
        treatment_node = f"treatment_{medication}"

        G.add_node(treatment_node)
        G.add_edge(patient_node, treatment_node)

    return G


# -------------------------
# Generate Embeddings
# -------------------------
def generate_embeddings(db):

    graph = build_graph(db)

    node2vec = Node2Vec(
        graph,
        dimensions=16,
        walk_length=10,
        num_walks=50,
        workers=1
    )

    model = node2vec.fit(window=5, min_count=1)

    embeddings = {}

    for node in graph.nodes():
        embeddings[node] = model.wv[node]

    return embeddings


# -------------------------
# Similarity Search
# -------------------------
def find_similar_patients(patient_id, embeddings, top_k=5):

    target = f"patient_{patient_id}"

    if target not in embeddings:
        return []

    target_vector = embeddings[target].reshape(1, -1)

    similarities = []

    for node, vector in embeddings.items():

        if not node.startswith("patient_"):
            continue

        if node == target:
            continue

        score = cosine_similarity(target_vector, vector.reshape(1, -1))[0][0]

        similarities.append((node, float(score)))

    similarities.sort(key=lambda x: x[1], reverse=True)

    return similarities[:top_k]