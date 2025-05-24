const line = require('@line/bot-sdk');
const { executeQuery } = require('./database');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

// In-memory session storage (can be replaced with Redis later)
const sessions = new Map();

const handleMessage = async (event) => {
  const userId = event.source.userId;
  const message = event.message.text;

  try {
    // Check for role-play command
    const rolePlayMatch = message.match(/สมมติว่า(?:ผม|ดิฉัน|ฉัน)เป็นพนักงาน(?:\s+)?emp_id(?:\s+)?=(?:\s+)?(\d+)/i);
    
    if (rolePlayMatch) {
      const empId = rolePlayMatch[1];
      const employee = await executeQuery(
        'SELECT * FROM employees WHERE emp_id = ?',
        [empId]
      );

      if (employee.length === 0) {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'ไม่พบข้อมูลพนักงานที่ระบุ กรุณาลองใหม่อีกครั้ง'
        });
      }

      // Store session
      sessions.set(userId, {
        empId: parseInt(empId),
        name: `${employee[0].first_name} ${employee[0].last_name}`,
        department: employee[0].department,
        position: employee[0].position
      });

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `โอเคครับ ตอนนี้คุณคือ ${employee[0].first_name} ${employee[0].last_name} ตำแหน่ง ${employee[0].position} แผนก ${employee[0].department}`
      });
    }

    // Handle leave request
    const leaveMatch = message.match(/ขอลา(ป่วย|กิจ|พักร้อน|คลอด|ฉุกเฉิน)\s+(\d{2}\/\d{2}\/\d{4})\s+ถึง\s+(\d{2}\/\d{2}\/\d{4})\s+เหตุผล\s+(.+)/i);
    
    if (leaveMatch) {
      const session = sessions.get(userId);
      if (!session) {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'กรุณาสมมติตัวตนก่อนทำการลา โดยพิมพ์: สมมติว่าผมเป็นพนักงาน emp_id = X'
        });
      }

      const [_, leaveType, startDate, endDate, reason] = leaveMatch;
      
      // Convert dates from DD/MM/YYYY to YYYY-MM-DD
      const formatDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
      };

      const start = formatDate(startDate);
      const end = formatDate(endDate);

      // Calculate number of days
      const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;

      await executeQuery(
        'INSERT INTO leave_requests (emp_id, leave_type, start_date, end_date, days, reason) VALUES (?, ?, ?, ?, ?, ?)',
        [session.empId, leaveType, start, end, days, reason]
      );

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `บันทึกการลา${leaveType}เรียบร้อยแล้ว\nวันที่: ${startDate} ถึง ${endDate}\nจำนวน: ${days} วัน\nเหตุผล: ${reason}\n\nอยู่ระหว่างรอการอนุมัติ`
      });
    }

    return null; // Let the main handler process other messages

  } catch (error) {
    console.error('LINE Service Error:', error);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    });
  }
};

const getCurrentSession = (userId) => {
  return sessions.get(userId);
};

module.exports = {
  config,
  client,
  handleMessage,
  getCurrentSession
};
