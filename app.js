document.getElementById('jobForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get user input values
    const skills = document.getElementById('skills').value;
    const experience = document.getElementById('experience').value;
    const preferences = document.getElementById('preferences').value;

    console.log('Form Data:', { skills, experience, preferences }); // Check if form data is correct

    // Send the data to the backend (POST request)
    const response = await fetch('https://ai-powered-job-matcher.onrender.com/match-job', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skills, experience, preferences })
    });

    const data = await response.json();
    console.log('Received Data:', data); // Log the received data

    // Display the job recommendations in the HTML
    displayJobResults(data);
});

// Function to display the job results on the page
function displayJobResults(data) {
    const jobResults = document.getElementById('jobResults');
    jobResults.innerHTML = '<h2>Job Recommendations:</h2>'; // Reset the section

    // Check if jobs array exists and has content
    if (data.jobs && data.jobs.length > 0) {
        data.jobs.forEach((job, index) => {
            jobResults.innerHTML += `
                <div class="job">
                    <h3>Job ${index + 1}: ${job.title}</h3>
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Description:</strong> ${job.description}</p>
                </div>
            `;
        });
    } else {
        jobResults.innerHTML += `<p>No job recommendations found.</p>`;
    }
}
