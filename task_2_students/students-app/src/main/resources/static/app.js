// src/main/resources/static/app.js

// Function to make a GET request to the backend
function fetchData(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// Function to render data received from the backend
function renderData(data) {
    // Render data on the page as needed
    console.log('Received data:', data);
}

// Event listener for initial page load
document.addEventListener('DOMContentLoaded', () => {
    fetchData('/api/initialData') // Change the URL to match your backend endpoint
        .then(data => {
            renderData(data);
        });
});

// Example of handling a button click to fetch more data
document.getElementById('fetchButton').addEventListener('click', () => {
    fetchData('/api/moreData') // Change the URL to match your backend endpoint
        .then(data => {
            renderData(data);
        });
});
