document.addEventListener('DOMContentLoaded', function() {
    
    fetch("/api")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            // Display the data on the page
            const container = document.getElementById('api-data-container');
            container.innerHTML = `
                <p>Description: ${data.weather[0].main}</p>
                <p>Temperature: ${data.main.temp}</p>
                <p> Feels Like: ${data.main.feels_like}</p>
            `;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const container = document.getElementById('api-data-container');
            container.innerHTML = `<p>Error loading data: ${error.message}</p>`;
        });
    });