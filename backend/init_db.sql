-- ==============================================================================
-- AgriSense Smart Farming Platform - Database Initialization
-- Clean 3-Entity Architecture (Zero Dummy Data):
-- 1. USER    (`users`)    - System authentication & roles (Admin only by default)
-- 2. CROP    (`crops`)    - Only stores real-time evaluations requested by users
-- 3. DISEASE (`diseases`) - Only stores leaf diagnoses scanned by users
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS agrisense_db;
USE agrisense_db;

-- Clean up any legacy tables to ensure ONLY the 3 entities exist
DROP TABLE IF EXISTS analysis_history;
DROP TABLE IF EXISTS user_history;
DROP TABLE IF EXISTS chat_sessions;
DROP TABLE IF EXISTS cultivation_guides;
DROP TABLE IF EXISTS market_prices;
DROP TABLE IF EXISTS crop_analyses;
DROP TABLE IF EXISTS disease_detections;
DROP TABLE IF EXISTS crops;
DROP TABLE IF EXISTS diseases;
DROP TABLE IF EXISTS users;

-- ==============================================================================
-- ENTITY 1: USER (`users`)
-- Stores user accounts. Only the Administrator is pre-configured.
-- New farmers will only appear when they actually register via the application.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'farmer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- ENTITY 2: CROP (`crops`)
-- Pure transactional table: Starts COMPLETELY EMPTY (0 records).
-- Records are ONLY inserted when a user asks for a crop suitability analysis.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS crops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) DEFAULT 'Guest Farmer',
    user_name VARCHAR(255) DEFAULT 'Guest Farmer',
    crop_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    land_size FLOAT DEFAULT 1.0,
    planting_month INT NOT NULL,
    is_recommended BOOLEAN DEFAULT TRUE,
    suitability_score INT DEFAULT 80,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- ENTITY 3: DISEASE (`diseases`)
-- Pure transactional table: Starts COMPLETELY EMPTY (0 records).
-- Records are ONLY inserted when a user uploads and diagnoses an infected leaf.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS diseases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) DEFAULT 'Guest Farmer',
    user_name VARCHAR(255) DEFAULT 'Guest Farmer',
    crop_name VARCHAR(255) NOT NULL,
    disease_name VARCHAR(255) NOT NULL,
    confidence FLOAT DEFAULT 0.95,
    severity VARCHAR(50) DEFAULT 'Moderate',
    symptoms TEXT,
    treatment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- ESSENTIAL SYSTEM ACCOUNT: ADMINISTRATOR
-- Needed so the admin can log in to view real user queries.
-- Email: admin@agrisense.lk | Password: admin123
-- ==============================================================================
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('System Administrator', 'admin@agrisense.lk', '0770000000', '$2b$12$4IUF9ZVGI9fiFyY5wj0Df.KgEpEzPHu1bXMyKs9GKjQ4JTpeOKhKe', 'admin');
