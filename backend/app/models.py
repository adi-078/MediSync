from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy.sql import func

class Hospital(Base):
    __tablename__ = "hospitals"

    hospital_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    location = Column(String)
    license_number = Column(String, unique=True, nullable=False)

    doctors = relationship("Doctor", back_populates="hospital")

class Doctor(Base):
    __tablename__ = "doctors"

    doctor_id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.hospital_id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    specialization = Column(String)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String, default="doctor")

    hospital = relationship("Hospital", back_populates="doctors")


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.hospital_id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    dob = Column(Date)
    gender = Column(String)
    contact = Column(String)
    medical_history_hash = Column(Text)


class Visit(Base):
    __tablename__ = "visits"

    visit_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"))
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id", ondelete="CASCADE"))
    visit_date = Column(TIMESTAMP(timezone=True), server_default=func.now())
    diagnosis = Column(Text, nullable=False)
    symptoms = Column(Text, nullable=False)


class Treatment(Base):
    __tablename__ = "treatments"

    treatment_id = Column(Integer, primary_key=True, index=True)

    visit_id = Column(Integer, ForeignKey("visits.visit_id"), nullable=False)

    medication = Column(String)
    dosage = Column(String)
    duration = Column(String)
    treatment_plan = Column(String)


class ClinicalTrial(Base):
    __tablename__ = "clinical_trials"

    trial_id = Column(Integer, primary_key=True)
    trial_name = Column(String, nullable=False)
    phase = Column(String)
    sponsor = Column(String)
    start_date = Column(Date)


class TrialEnrollment(Base):
    __tablename__ = "trial_enrollments"

    enrollment_id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    trial_id = Column(Integer, ForeignKey("clinical_trials.trial_id"), nullable=False)

    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"))

    status = Column(String(50))

    enrollment_date = Column(Date, server_default=func.current_date())


class TrialOutcome(Base):
    __tablename__ = "trial_outcomes"

    outcome_id = Column(Integer, primary_key=True, index=True)

    enrollment_id = Column(
        Integer,
        ForeignKey("trial_enrollments.enrollment_id"),
        nullable=False
    )

    observation_date = Column(Date, server_default=func.current_date())

    result = Column(String)
    side_effects = Column(String)
    effectiveness_score = Column(Integer)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(Integer, primary_key=True)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id", ondelete="SET NULL"))
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="SET NULL"))
    action = Column(String)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now())