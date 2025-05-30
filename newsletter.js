require('dotenv').config();
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { Configuration, OpenAIApi } = require('openai');
const { getActiveSubscribers } = require('./db');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Configure nodemailer transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fetch top tech news headlines (Hacker News example)
async function fetchTechNews() {
  const topIds = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json').then(r => r.json());
  const first10 = topIds.slice(0, 10);
  const stories = await Promise.all(
    first10.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()))
  );
  return stories.map(s => s.title).filter(Boolean);
}

// Generate summary with OpenAI
async function generateSummary(headlines) {
  const prompt = `Write a concise, engaging tech newsletter summary (under 200 words) based on these headlines:\n\n${headlines.join('\n')}\n\nNewsletter:`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 250,
  });
  return completion.data.choices[0].message.content.trim();
}

// Send email to recipients
async function sendNewsletter(content, recipients) {
  if (!recipients.length) return;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: recipients.join(','),
    subject: 'Your Daily Byte Newsletter',
    text: content,
    html: `<p>${content.replace(/\n/g, '<br>')}</p>`,
  });
}

// Schedule: every day at 8:00 AM server time
cron.schedule('0 8 * * *', async () => {
  try {
    console.log('Generating daily newsletter...');
    const headlines = await fetchTechNews();
    const summary = await generateSummary(headlines);
    const recipients = getActiveSubscribers();
    await sendNewsletter(summary, recipients);
    console.log('Newsletter sent to', recipients.length, 'subscribers');
  } catch (err) {
    console.error('Newsletter error:', err);
  }
});

console.log('Newsletter scheduler initialized');
