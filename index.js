require('dotenv').config();
const express = require('express');
const { generateSqlQuery, formatResponse } = require('./utils/ai-service');
const { config, client, handleMessage, getCurrentSession } = require('./utils/line-service');
const { executeQuery } = require('./utils/database');

const app = express();

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
  console.log(`Server is running on port ${port}`);
});
