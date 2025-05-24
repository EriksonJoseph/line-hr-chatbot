# LINE HR Chatbot with Natural Language Processing

ระบบ LINE Chatbot สำหรับ HR ที่สามารถตอบคำถามเกี่ยวกับข้อมูลพนักงานด้วยภาษาธรรมชาติ และรองรับการสมมติตัวตนของพนักงาน

## คุณสมบัติหลัก

- 🤖 ตอบคำถามด้วยภาษาไทยธรรมชาติ
- 👥 รองรับการสมมติตัวตนของพนักงาน
- 🔄 แปลงคำถามเป็น SQL query อัตโนมัติด้วย Google Gemini
- 📊 เชื่อมต่อกับฐานข้อมูล MySQL
- 📝 ระบบขอลางานผ่าน chat
- 🔒 ระบบจัดการ session แบบ in-memory

## การติดตั้ง

1. Clone repository:
\`\`\`bash
git clone <repository-url>
cd line-hr-chatbot
\`\`\`

2. ติดตั้ง dependencies:
\`\`\`bash
npm install
\`\`\`

3. สร้างไฟล์ .env:
\`\`\`bash
cp .env.example .env
\`\`\`

4. กำหนดค่า environment variables ใน .env:
\`\`\`
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret
GOOGLE_AI_API_KEY=your_google_gemini_api_key
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306
PORT=3000
\`\`\`

## การใช้งาน

1. รันเซิร์ฟเวอร์:
\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

2. ตั้งค่า Webhook URL ใน LINE Developers Console:
   - URL: https://your-domain.com/webhook
   - ต้องเป็น HTTPS
   - เปิดใช้งาน "Use webhook"

## ตัวอย่างการใช้งาน

### สมมติตัวตน
\`\`\`
User: สมมติว่าผมเป็นพนักงาน emp_id = 7
Bot: โอเคครับ ตอนนี้คุณคือ สุดา อุตสาห์ ตำแหน่ง HR Officer แผนก HR
\`\`\`

### สอบถามข้อมูลการมาทำงาน
\`\`\`
User: เมื่อเดือนมกราฉันมาสายหรือว่าขาดงานบ้างมั้ย
Bot: ขาดงาน 1 ครั้งเมื่อวัน 10/01/2024
\`\`\`

### ขอลางาน
\`\`\`
User: ขอลาป่วย 25/05/2024 ถึง 26/05/2024 เหตุผล ไข้หวัดใหญ่
Bot: บันทึกการลาป่วยเรียบร้อยแล้ว
วันที่: 25/05/2024 ถึง 26/05/2024
จำนวน: 2 วัน
เหตุผล: ไข้หวัดใหญ่

อยู่ระหว่างรอการอนุมัติ
\`\`\`

## การ Deploy

### Vercel
1. ติดตั้ง Vercel CLI:
\`\`\`bash
npm i -g vercel
\`\`\`

2. Deploy:
\`\`\`bash
vercel
\`\`\`

### Database
แนะนำให้ใช้ PlanetScale หรือ Supabase (Free Tier)

## โครงสร้างโปรเจค

\`\`\`
line-hr-chatbot/
├── index.js           # เซิร์ฟเวอร์หลัก
├── package.json       # dependencies
├── .env.example      # ตัวอย่าง environment variables
├── README.md         # เอกสาร
├── vercel.json       # คอนฟิก Vercel
└── utils/
    ├── database.js   # เชื่อมต่อฐานข้อมูล
    ├── ai-service.js # บริการ AI
    └── line-service.js # บริการ LINE Bot
\`\`\`

## ความต้องการของระบบ

- Node.js 18.x ขึ้นไป
- MySQL 8.x หรือ PlanetScale
- LINE Messaging API Channel
- Google Gemini API Key

## การพัฒนาเพิ่มเติม

- [ ] เพิ่ม Redis สำหรับจัดการ session
- [ ] เพิ่ม Rich Menu และ Quick Reply
- [ ] ระบบแจ้งเตือนอัตโนมัติ
- [ ] ระบบรายงานสรุป
- [ ] การแสดงผลในรูปแบบ Flex Message

## License

MIT
