from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import auth_routes, patient_routes, visit_routes, audit_routes
from .routes import trial_routes
from .routes import treatment_routes
from .routes import analytics_routes
from .routes import ai_routes
from app.routes import analytics
app = FastAPI(title="MedLink Backend")

# -------------------------
# CORS CONFIGURATION
# -------------------------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Create tables if not exist
# -------------------------
Base.metadata.create_all(bind=engine)

# -------------------------
# Register API routes
# -------------------------
app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(patient_routes.router, prefix="/patients", tags=["Patients"])
app.include_router(visit_routes.router, prefix="/visits", tags=["Visits"])
app.include_router(audit_routes.router, prefix="/audit", tags=["Audit Logs"])
app.include_router(trial_routes.router, prefix="/trials", tags=["Clinical Trials"])
app.include_router(treatment_routes.router, prefix="/treatments", tags=["Treatments"])
app.include_router(analytics_routes.router, prefix="/analytics", tags=["Analytics"])
app.include_router(ai_routes.router, prefix="/ai", tags=["AI"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
# -------------------------
# Root endpoint
# -------------------------
@app.get("/")
def home():
    return {"message": "Welcome to MedLink Backend 🚀"}