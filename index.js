const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'process.env.GOOGLE_API_KEY';

if (!apiKey) {
  throw new Error("The API key is missing or empty; please provide it.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).send('Prompt is required');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    // Check if the result has the expected structure
    if (result && result.response && result.response.candidates && result.response.candidates[0]) {
      const candidate = result.response.candidates[0];

      if (candidate.content && candidate.content.parts) {
        // Extract text from the parts array
        const text = candidate.content.parts.map(part => typeof part === 'object' ? JSON.stringify(part) : part).join(' ');
        return res.send(text);
      } else {
        return res.status(500).send('The candidate does not contain the expected content or parts.');
      }
    } else {
      return res.status(500).send('The response does not contain the expected candidates.');
    }
  } catch (err) {
    console.error('Error during generation:', err);
    return res.status(500).send('Failed to generate content');
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
