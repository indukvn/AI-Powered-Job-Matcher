const express = require('express');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config(); // To load environment variables

const app = express();

// Middleware to handle JSON requests
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
    const prompt = `You are a job matching assistant. Based on the following information, recommend suitable job titles, companies, and descriptions:

Skills: ${skills}
Experience: ${experience}
Preferences: ${preferences}

Format the output as follows:
Job Title: [Job Title]
Company: [Company Name]
Description: [Job Description]

Provide at least 3 job recommendations.`;

    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/gpt2',
            { inputs: prompt },
            { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
        );

        // Parse the response data into a more structured format
        const jobRecommendations = response.data[0].generated_text.split("\n").map((line) => {
            if (line.includes('Job Title:') && line.includes('Company:') && line.includes('Description:')) {
                const jobDetails = line.split('Description:');
                const titleAndCompany = jobDetails[0].split('Company:');
                return {
                    title: titleAndCompany[0].replace('Job Title:', '').trim(),
                    company: titleAndCompany[1].trim(),
                    description: jobDetails[1].trim(),
                };
            }
            return null;
        }).filter(job => job !== null);

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
