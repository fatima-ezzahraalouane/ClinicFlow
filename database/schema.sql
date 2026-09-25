-- =====================================================================
-- ClinicFlow — Database schema
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- users : clinic staff accounts (admin | staff)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name      VARCHAR(150)  NOT NULL,
    email          VARCHAR(255)  NOT NULL,
    password_hash  VARCHAR(255)  NOT NULL,          -- bcrypt hash
    role           VARCHAR(20)   NOT NULL,          -- 'admin' | 'staff' (validated by Zod)
    created_at     TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP     NOT NULL DEFAULT now(),

    CONSTRAINT users_email_key UNIQUE (email)
);

-- ---------------------------------------------------------------------
-- patients
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name   VARCHAR(150)  NOT NULL,
    cin         VARCHAR(20)   NOT NULL,
    phone       VARCHAR(20)   NOT NULL,
    birth_date  DATE          NOT NULL,
    address     TEXT,                               -- optional
    created_at  TIMESTAMP     NOT NULL DEFAULT now(),

    CONSTRAINT patients_cin_key UNIQUE (cin)        
);

-- ---------------------------------------------------------------------
-- appointments : links one patient and one creator (user)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID          NOT NULL,
    appointment_date  TIMESTAMP     NOT NULL,       -- date + time
    status            VARCHAR(20)   NOT NULL DEFAULT 'pending',  -- pending | confirmed | cancelled (Zod)
    reason            VARCHAR(255)  NOT NULL,
    notes             TEXT,                         -- optional
    created_by        UUID,                         -- nullable: kept if user is deleted
    created_at        TIMESTAMP     NOT NULL DEFAULT now(),

    CONSTRAINT appointments_patient_id_fkey
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE RESTRICT,

    CONSTRAINT appointments_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- Indexes (search, joins, filters, dashboard)
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_patients_full_name            ON patients (full_name);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id       ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status           ON appointments (status);

COMMIT;

