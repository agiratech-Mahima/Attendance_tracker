CREATE DATABASE attendance_tracker;

USE attendance_tracker;

CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_name VARCHAR(100) NOT NULL,
  action ENUM('Check-in', 'Check-out') NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
