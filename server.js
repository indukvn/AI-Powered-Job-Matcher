const express = require('express');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config(); // To load environment variables

const app = express();

// Serve static files from the root directory
app.use(express.static(__dirname));

// Middleware to handle JSON requests
app.use(express.json());

// Define route for the root (home page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));  // Serve the index.html from the root directory
});

// Job Matching API Route
app.post('/match-job', async (req, res) => {
    const { skills, experience, preferences } = req.body;

    try {
        // Call the function to get job recommendations from Hugging Face API
        const jobRecommendations = await getJobRecommendations(skills, experience, preferences);
        
        // Return the job recommendations as a JSON response
        res.json({ jobs: jobRecommendations });
    } catch (error) {
        console.error("Error during Hugging Face API call", error);
        res.status(500).json({ error: "Error generating job recommendations" });
    }
});

// Function to get job recommendations from Hugging Face API
async function getJobRecommendations(skills, experience, preferences) {
    const prompt = `You are a job matching assistant. Based on the following information, recommend at least 3 suitable job titles, companies, and descriptions. Format the response clearly:

Skills: ${skills}
Experience: ${experience}
Preferences: ${preferences}

Format the output as follows:
Job 1:
Job Title: [Job Title]
Company: [Company Name]
Description: [Job Description]

Job 2:
Job Title: [Job Title]
Company: [Company Name]
Description: [Job Description]

Job 3:
Job Title: [Job Title]
Company: [Company Name]
Description: [Job Description]
`;

    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/gpt2',
            { inputs: prompt },
            { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
        );

        // Log the response to verify data
        console.log("Hugging Face Response:", response.data);

        const jobRecommendations = [];
        const text = response.data[0].generated_text;

        // Check if we are getting a structured response
        const jobPattern = /Job \d+:\s*Job Title:\s*(.*)\s*Company:\s*(.*)\s*Description:\s*(.*)/g;
        let match;
        
        // Extract structured job data using regex
        while ((match = jobPattern.exec(text)) !== null) {
            jobRecommendations.push({
                title: match[1].trim(),
                company: match[2].trim(),
                description: match[3].trim(),
            });
        }

        return jobRecommendations;

    } catch (error) {
        console.error("Error during Hugging Face API call", error);
        return [];
    }
}

// Set the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
