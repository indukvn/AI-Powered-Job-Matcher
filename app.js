document.getElementById('jobForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const skills = document.getElementById('skills').value;
    const experience = document.getElementById('experience').value;
    const preferences = document.getElementById('preferences').value;

    const response = await fetch('https://your-heroku-api.herokuapp.com/match-job', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skills, experience, preferences })
    });

    const data = await response.json();
    displayJobResults(data);
});

function displayJobResults(data) {
    const jobResults = document.getElementById('jobResults');
    jobResults.innerHTML = '<h2>Job Recommendations:</h2>';

    if (data.jobs && data.jobs.length > 0) {
        data.jobs.forEach(job => {
            jobResults.innerHTML += `
                <div class="job">
                    <h3>${job.title}</h3>
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Description:</strong> ${job.description}</p>
                </div>
            `;
        });
    } else {
        jobResults.innerHTML += `<p>No job recommendations found.</p>`;
    }
}
