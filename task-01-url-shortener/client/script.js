
// Get HTML elements
const urlForm = document.getElementById("urlForm");
const originalUrlInput = document.getElementById("originalUrl");
const shortenBtn = document.getElementById("shortenBtn");
const message = document.getElementById("message");
const resultContainer = document.getElementById("resultContainer");
const shortUrlElement = document.getElementById("shortUrl");
const copyBtn = document.getElementById("copyBtn");
const clickCount = document.getElementById("clickCount");

// Backend API URL
const API_URL = "http://localhost:5000/api/urls";

// Handle form submission
urlForm.addEventListener("submit", async (event) => {
    // Prevent the browser from refreshing the page
    event.preventDefault();

    const originalUrl = originalUrlInput.value.trim();

    // Clear previous messages and results
    message.textContent = "";
    message.className = "message";
    resultContainer.classList.add("hidden");

    // Disable button while request is processing
    shortenBtn.disabled = true;
    shortenBtn.textContent = "Shortening...";

    try {
        // Send URL to the backend
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                originalUrl: originalUrl,
            }),
        });

        // Convert backend response into JavaScript object
        const result = await response.json();

        // Handle unsuccessful response
        if (!response.ok) {
            throw new Error(result.message || "Unable to shorten URL");
        }

        // Read the generated URL from the response
        const urlData = result.data || result;

        const generatedShortUrl = urlData.shortUrl;

        if (!generatedShortUrl) {
            throw new Error("Short URL was not found in the server response");
        }

        // Display generated URL
        shortUrlElement.textContent = generatedShortUrl;
        shortUrlElement.href = generatedShortUrl;

        // Display click count
        clickCount.textContent = `Clicks: ${urlData.clicks ?? 0}`;

        // Show result section
        resultContainer.classList.remove("hidden");

        // Display success message
        message.textContent = "Your URL has been shortened successfully!";
        message.classList.add("success");

        // Clear input field
        originalUrlInput.value = "";
        await loadRecentUrls();

    } catch (error) {
        console.error("URL shortening error:", error);

        message.textContent = error.message;
        message.classList.add("error");

    } finally {
        // Enable button again
        shortenBtn.disabled = false;
        shortenBtn.textContent = "Shorten URL";
    }
});

// Copy shortened URL
copyBtn.addEventListener("click", async () => {
    const generatedShortUrl = shortUrlElement.href;

    try {
        await navigator.clipboard.writeText(generatedShortUrl);

        copyBtn.textContent = "Copied!";

        setTimeout(() => {
            copyBtn.textContent = "Copy";
        }, 2000);

    } catch (error) {
        console.error("Copy error:", error);
        message.textContent = "Unable to copy the URL. Please copy it manually.";
        message.className = "message error";
    }
});


// Get history section elements
const urlList = document.getElementById("urlList");
const refreshBtn = document.getElementById("refreshBtn");

// Fetch recently shortened URLs from the backend
async function loadRecentUrls() {
    urlList.innerHTML = '<p class="history-message">Loading URLs...</p>';

    try {
        const response = await fetch(API_URL);

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load URLs");
        }

        const urls = result.data;

        // Check whether any URLs exist
        if (urls.length === 0) {
            urlList.innerHTML =
                '<p class="history-message">No shortened URLs found yet.</p>';
            return;
        }

        // Clear the loading message
        urlList.innerHTML = "";

        // Display each URL
        urls.forEach((url) => {
            const urlItem = document.createElement("div");
            urlItem.className = "url-item";

            const originalLink = document.createElement("p");
            originalLink.textContent = url.originalUrl;

            const shortLink = document.createElement("a");
            shortLink.href = `${window.location.protocol}//${window.location.hostname}:5000/${encodeURIComponent(url.shortCode)}`;
            shortLink.textContent = shortLink.href;
            shortLink.target = "_blank";
            shortLink.rel = "noopener noreferrer";

            const clicks = document.createElement("p");
            clicks.className = "url-clicks";
            clicks.textContent = `Clicks: ${url.clicks}`;

            urlItem.appendChild(originalLink);
            urlItem.appendChild(shortLink);
            urlItem.appendChild(clicks);

            urlList.appendChild(urlItem);
        });

    } catch (error) {
        console.error("History loading error:", error);

        urlList.innerHTML =
            '<p class="history-message">Unable to load URLs. Please try again.</p>';
    }
}

// Refresh history when the button is clicked
refreshBtn.addEventListener("click", loadRecentUrls);

// Load history when the page opens
loadRecentUrls();
