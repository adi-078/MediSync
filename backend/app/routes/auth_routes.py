from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Doctor
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register")
def register(
    email: str,
    password: str,
    hospital_id: int,
    db: Session = Depends(get_db)
):

    # Check if doctor already exists
    existing = db.query(Doctor).filter(Doctor.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Doctor already exists")

    hashed = hash_password(password)

    doctor = Doctor(
        email=email,
        password_hash=hashed,   # ✅ correct column name
        hospital_id=hospital_id,
        role="doctor",
        name="Doctor"           # Required if NOT NULL in DB
    )

    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    return {"message": "Doctor registered successfully"}


@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):

    doctor = db.query(Doctor).filter(Doctor.email == email).first()

    if not doctor:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # ✅ Use correct column name
    if not verify_password(password, doctor.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "doctor_id": doctor.doctor_id,      # ✅ correct field
        "hospital_id": doctor.hospital_id
    })

    return {"access_token": token, "token_type": "bearer"}