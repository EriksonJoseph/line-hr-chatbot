const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const SCHEMA = `
CREATE TABLE employees (
    emp_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL,
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    status ENUM('active', 'inactive', 'resigned') DEFAULT 'active'
);

CREATE TABLE attendance (
    att_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    total_hours DECIMAL(4,2) DEFAULT 0,
    status ENUM('present', 'absent', 'late', 'half_day') DEFAULT 'present',
    notes TEXT
);

CREATE TABLE leave_requests (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id INT NOT NULL,
    leave_type ENUM('ลาป่วย', 'ลากิจ', 'ลาพักร้อน', 'ลาคลอด', 'ลาฉุกเฉิน') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE benefits (
    benefit_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_id INT NOT NULL,
    social_security DECIMAL(8,2) DEFAULT 0,
    health_insurance DECIMAL(8,2) DEFAULT 0,
    life_insurance DECIMAL(8,2) DEFAULT 0,
    provident_fund DECIMAL(8,2) DEFAULT 0,
    annual_leave_days INT DEFAULT 6,
    sick_leave_days INT DEFAULT 30,
    personal_leave_days INT DEFAULT 3,
    effective_date DATE NOT NULL
);`;

const generateSqlQuery = async (question, empId = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Database Schema: ${SCHEMA}
Current user emp_id: ${empId || 'None'}
Today's date: ${new Date().toISOString().split('T')[0]}

Convert this Thai question to SQL query: "${question}"

Rules:
1. If asking about "ฉัน/ผม/ดิฉัน" and emp_id exists, add WHERE emp_id = ${empId}
2. For date queries, use proper date formatting
3. Join tables when needed
4. Return only the SQL query, no explanation
5. Use Thai month names mapping: มกราคม=01, กุมภาพันธ์=02, etc.
6. For time-related queries: เมื่อวาน = CURRENT_DATE - 1, วันนี้ = CURRENT_DATE
7. Return NULL if the question cannot be converted to SQL`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const sql = response.text().trim();
    
    return sql === 'NULL' ? null : sql;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
};

const formatResponse = async (sql, results, question) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
SQL Query: ${sql}
Results: ${JSON.stringify(results)}
Original Question: "${question}"

Convert the SQL results to a natural Thai response that answers the original question.
Keep it concise and friendly. Use Thai date format DD/MM/YYYY.
If no results, say "ไม่พบข้อมูล" or appropriate message.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('AI Formatting Error:', error);
    throw error;
  }
};

module.exports = {
  generateSqlQuery,
  formatResponse
};
