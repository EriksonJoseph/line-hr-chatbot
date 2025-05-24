require('dotenv').config();
const express = require('express');
const { generateSqlQuery, formatResponse } = require('./utils/ai-service');
const { client, handleMessage, getCurrentSession } = require('./utils/line-service');
const { executeQuery } = require('./utils/database');

const app = express();

// Health check functions
const checkDatabase = async () => {
  try {
    await executeQuery('SELECT 1');
    console.log('✅ Database connection: OK');
    return true;
  } catch (error) {
    console.error('❌ Database connection: Failed', error.message);
    return false;
  }
};

const checkLineBot = async () => {
  try {
    // Test LINE Bot configuration
    const testMessage = {
      to: 'U0000000000000000000000000000000', // Use a test user ID
      messages: [{
        type: 'text',
        text: 'Test message from LINE Bot'
      }]
    };
    
    // Try to send a test message (this will fail but we just want to test the configuration)
    await client.pushMessage(testMessage.to, testMessage.messages);
    console.log('✅ LINE Bot configuration: OK');
    return true;
  } catch (error) {
    console.error('❌ LINE Bot configuration: Failed', error.message);
    return false;
  }
};

const checkGoogleGemini = async () => {
  try {
    // Test Google Gemini API
    const model = require('@google/generative-ai').getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Hello, how are you?');
    console.log('✅ Google Gemini API: OK');
    return true;
  } catch (error) {
    console.error('❌ Google Gemini API: Failed', error.message);
    return false;
  }
};

// Run health checks on startup
async function runHealthChecks() {
  console.log('🚀 Starting health checks...');
  
  const dbOk = await checkDatabase();
  const lineOk = await checkLineBot();
  const geminiOk = await checkGoogleGemini();
  
  if (!dbOk || !lineOk || !geminiOk) {
    console.error('❌ Some services are not working correctly. Please check the logs above.');
    process.exit(1);
  }
  
  console.log('✅ All services are working correctly!');
}

// Run health checks when starting the server
runHealthChecks().catch(console.error);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LINE webhook middleware
app.post('/webhook', express.json(), async (req, res) => {
  try {
    console.log(`🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀Hello Torpong🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀`)
    const events = req.body.events;
    
    await Promise.all(events.map(async (event) => {
      if (event.type !== 'message' || event.message.type !== 'text') {
        return;
      }

      // Try handling special commands first (role-play, leave requests)
      const specialResponse = await handleMessage(event);
      if (specialResponse) return;

      const session = getCurrentSession(event.source.userId);
      const question = event.message.text;

      try {
        // Generate SQL query from the question
        const sql = await generateSqlQuery(question, session?.empId);
        
        if (!sql) {
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: 'ขออภัย ไม่สามารถเข้าใจคำถามได้ กรุณาลองถามใหม่อีกครั้ง'
          });
        }

        // Execute the query
        const results = await executeQuery(sql);
        
        // Format the response
        const response = await formatResponse(sql, results, question);

        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: response
        });

      } catch (error) {
        console.error('Error processing message:', error);
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'ขออภัย เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง'
        });
      }
    }));

    res.status(200).end();
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).end();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 Server is running on port ${port} 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀`);
});
