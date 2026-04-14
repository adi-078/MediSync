-- ===========================
-- 1. Hospital Table
-- ===========================
CREATE TABLE hospitals (
    hospital_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255),
    license_number VARCHAR(100) UNIQUE NOT NULL
);

-- ===========================
-- 2. Doctor Table
-- ===========================
CREATE TABLE doctors (
    doctor_id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'doctor',

    CONSTRAINT fk_doctor_hospital
        FOREIGN KEY (hospital_id)
        REFERENCES hospitals(hospital_id)
        ON DELETE CASCADE
);

-- ===========================
-- 3. Patient Table
-- ===========================
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    hospital_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    dob DATE,
    gender VARCHAR(20),
    contact VARCHAR(20),
    medical_history_hash TEXT,

    CONSTRAINT fk_patient_hospital
        FOREIGN KEY (hospital_id)
        REFERENCES hospitals(hospital_id)
        ON DELETE CASCADE
);

-- ===========================
-- 4. Visit Table (Longitudinal Anchor)
-- ===========================
CREATE TABLE visits (
    visit_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diagnosis TEXT NOT NULL,
    symptoms TEXT NOT NULL,

    CONSTRAINT fk_visit_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_visit_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(doctor_id)
        ON DELETE CASCADE
);

-- ===========================
-- 5. Treatment Table
-- ===========================
CREATE TABLE treatments (
    treatment_id SERIAL PRIMARY KEY,
    visit_id INTEGER NOT NULL,
    medication VARCHAR(255),
    dosage VARCHAR(255),
    duration VARCHAR(255),

    CONSTRAINT fk_treatment_visit
        FOREIGN KEY (visit_id)
        REFERENCES visits(visit_id)
        ON DELETE CASCADE
);

-- ===========================
-- 6. Clinical Trial Table
-- ===========================
CREATE TABLE clinical_trials (
    trial_id SERIAL PRIMARY KEY,
    trial_name VARCHAR(255) NOT NULL,
    phase VARCHAR(50),
    sponsor VARCHAR(255),
    start_date DATE
);

-- ===========================
-- 7. Trial Enrollment (Junction Table)
-- ===========================
CREATE TABLE trial_enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    trial_id INTEGER NOT NULL,
    status VARCHAR(50),
    enrollment_date DATE DEFAULT CURRENT_DATE,

    CONSTRAINT fk_enrollment_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enrollment_trial
        FOREIGN KEY (trial_id)
        REFERENCES clinical_trials(trial_id)
        ON DELETE CASCADE
);

-- ===========================
-- 8. Trial Outcome
-- ===========================
CREATE TABLE trial_outcomes (
    outcome_id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL,
    observation_date DATE DEFAULT CURRENT_DATE,
    result TEXT,

    CONSTRAINT fk_outcome_enrollment
        FOREIGN KEY (enrollment_id)
        REFERENCES trial_enrollments(enrollment_id)
        ON DELETE CASCADE
);

-- ===========================
-- 9. Audit Logs (Black Box Recorder)
-- ===========================
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    doctor_id INTEGER,
    patient_id INTEGER,
    action VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(doctor_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_audit_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id)
        ON DELETE SET NULL
);