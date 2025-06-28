let quotes = [];
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API endpoint

// Fetch quotes from server
async function fetchQuotesFromServer() {
  const response = await fetch(SERVER_URL);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  // Map or filter data if needed to fit quote structure, for now assume data is suitable
  // Example: map first 10 posts as quotes with title as text and body as category for demo
  return data.slice(0, 10).map(post => ({
    text: post.title,
    category: post.body.length > 20 ? "Inspiration" : "Motivation"
  }));
}

// Post quotes to server (mock POST)
async function postQuotesToServer(quotesToPost) {
  const response = await fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(quotesToPost)
  });
  if (!response.ok) {
    throw new Error("Failed to post data");
  }
  return response.json();
}

// Load quotes from localStorage or sync from server if none found
async function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    await syncQuotes();
  }
}

// Save quotes locally
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Sync local quotes with server: fetch and post with conflict resolution
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    // Conflict resolution: server data takes precedence
    quotes = serverQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();

    // Post local quotes to server (simulate sync back)
    await postQuotesToServer(quotes);

    showNotification("Quotes synced with server!");
  } catch (error) {
    console.error("Sync failed:", error);
    showNotification("Failed to sync with server.");
  }
}

// Periodically sync every 30 seconds
setInterval(syncQuotes, 30000);

// Populate category dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedFilter;
}

// Filter quotes and display based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  displayQuotes(filteredQuotes);
}

// Display one random quote from the filtered list
function displayQuotes(quoteArray) {
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (quoteArray.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * quoteArray.length);
  const quote = quoteArray[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>Category: ${quote.category}</small>`;

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Show last viewed quote or filter quotes on load
function showLastViewedQuote() {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    displayQuotes([JSON.parse(lastQuote)]);
  } else {
    filterQuotes();
  }
}

// Add a new quote from inputs
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// Create input fields for adding quotes
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  const textGroup = document.createElement("div");
  textGroup.className = "input-icon";
  textGroup.innerHTML = `
    <i class="fas fa-quote-left"></i>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
  `;

  const categoryGroup = document.createElement("div");
  categoryGroup.className = "input-icon";
  categoryGroup.innerHTML = `
    <i class="fas fa-tags"></i>
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
  `;

  formContainer.appendChild(textGroup);
  formContainer.appendChild(categoryGroup);
}

// Export quotes to JSON file
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Failed to import JSON.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Show notification messages on UI
function showNotification(message) {
  const div = document.createElement("div");
  div.textContent = message;
  div.style.cssText =
    "position: fixed; bottom: 1rem; right: 1rem; background: #007acc; color: white; padding: 10px 16px; border-radius: 6px; font-size: 0.9rem; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 9999;";
  document.body.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 4000);
}

// DOM event bindings
document.getElementById("newQuote").addEventListener("click", filterQuotes);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

// Initialize app
(async function () {
  await loadQuotes();
  createAddQuoteForm();
  populateCategories();
  showLastViewedQuote();
})();
