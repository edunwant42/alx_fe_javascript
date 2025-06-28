let quotes = [];
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Fetch quotes from server and map to your format
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    // Map first 10 posts to quote format
    const serverQuotes = data.slice(0, 10).map(post => ({
      text: post.title,
      category: post.body ? post.body.substring(0, 15).trim() : "General"
    }));

    return serverQuotes;
  } catch (error) {
    console.error("Error fetching from server:", error);
    return null;
  }
}

// Sync local quotes with server (server data wins)
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  if (serverQuotes && Array.isArray(serverQuotes)) {
    quotes = serverQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification("Quotes synced with server.");
  } else {
    showNotification("Failed to sync with server.");
  }
}

// Load quotes from localStorage or from server if none found
async function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    await syncQuotes();
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories dropdown dynamically
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

// Filter quotes based on category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  displayQuotes(filteredQuotes);
}

// Display a random quote from filtered list
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

// Show last viewed quote or filtered quotes on load
function showLastViewedQuote() {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    displayQuotes([JSON.parse(lastQuote)]);
  } else {
    filterQuotes();
  }
}

// Add new quote to local list and update UI
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

// Create input form for adding quotes
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

// Export quotes as JSON file
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
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

// Show notifications on screen
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

// Event listeners for buttons
document.getElementById("newQuote").addEventListener("click", filterQuotes);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

// Initialize app
(async function () {
  await loadQuotes();
  createAddQuoteForm();
  populateCategories();
  showLastViewedQuote();

  // Start periodic sync every 30 seconds
  setInterval(syncQuotes, 30000);
})();
