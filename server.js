const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.post('/match-job', async (req, res) => {
    const { skills, experience, preferences } = req.body;

    try {
        // Call OpenAI's GPT-3 API to generate job recommendations
        const response = await axios.post(
            'https://api.openai.com/v1/completions',
            {
                model: 'text-davinci-003',
                prompt: `Match jobs based on the following information:\nSkills: ${skills}\nExperience: ${experience}\nPreferences: ${preferences}\nProvide job titles, companies, and descriptions.`,
                max_tokens: 150,
            },
            {
                headers: {
                    'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
                }
            });

        const jobRecommendations = response.data.choices[0].text.trim().split("\n").map(line => {
            const [title, company, description] = line.split(',');
            return { title, company, description };
        });

        res.json({ jobs: jobRecommendations });
    } catch (error) {
        console.error('Error during GPT-3 call', error);
        res.status(500).json({ error: 'Error matching jobs' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
