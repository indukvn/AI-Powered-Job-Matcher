document.getElementById('jobForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get user input values
    const skills = document.getElementById('skills').value;
    const experience = document.getElementById('experience').value;
    const preferences = document.getElementById('preferences').value;

    // Send the data to the backend (POST request)
    const response = await fetch('https://ai-powered-job-matcher.onrender.com/match-job', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skills, experience, preferences })
    });

    const data = await response.json();

    // Clear the previous job recommendations
    const jobRecommendationsContainer = document.getElementById('jobRecommendations');
    jobRecommendationsContainer.innerHTML = ''; // Clear previous results

    // Display the job recommendations
    if (data.jobs.length === 0) {
        jobRecommendationsContainer.innerHTML = '<p>No job recommendations found.</p>';
    } else {
        data.jobs.forEach((job, index) => {
            const jobElement = document.createElement('div');
            jobElement.innerHTML = `
                <p><strong>Job ${index + 1}:</strong></p>
                <p><strong>Job Title:</strong> ${job.title}</p>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Description:</strong> ${job.description}</p>
            `;
            jobRecommendationsContainer.appendChild(jobElement);
        });
    }
});
