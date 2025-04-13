const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.post('/match-job', async (req, res) => {
    const { skills, experience, preferences } = req.body;

    try {
        // Prepare prompt for job matching
        const prompt = `Match jobs based on the following information:
                        Skills: ${skills}
                        Experience: ${experience}
                        Preferences: ${preferences}
                        Provide job titles, companies, and descriptions.`;

        // API Call to Hugging Face Model
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/gpt2',
            {
                inputs: prompt,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                },
            }
        );

        // Extract job data from the response
        const jobRecommendations = response.data[0].generated_text.split("\n").map(line => {
            const [title, company, description] = line.split(',');
            return { title, company, description };
        });

        res.json({ jobs: jobRecommendations });
    } catch (error) {
        console.error('Error during Hugging Face API call', error);
        res.status(500).json({ error: 'Error matching jobs' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
