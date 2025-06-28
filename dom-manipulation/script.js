const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock API endpoint
let quotes = [];

// Fetch quotes from server (GET)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error("Failed to fetch from server");
    const data = await response.json();
    // For demo, transform JSONPlaceholder posts to your quotes format if needed:
    // Here, let's take first 10 posts as quotes
    const serverQuotes = data.slice(0, 10).map(post => ({
      text: post.title,
      category: "Server Quote"
    }));
    return serverQuotes;
  } catch (error) {
    console.error("fetchQuotesFromServer error:", error);
    return null;
  }
}

// Sync local quotes to server (POST)
async function syncQuotes() {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quotes),
    });
    if (!response.ok) throw new Error("Failed to post to server");
    const result = await response.json();
    console.log("syncQuotes result:", result);
    showNotification("Quotes synced to server.");
  } catch (error) {
    console.error("syncQuotes error:", error);
    showNotification("Failed to sync quotes to server.");
  }
}

// Load quotes (from localStorage or server)
async function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    const serverQuotes = await fetchQuotesFromServer();
    if (Array.isArray(serverQuotes)) {
      quotes = serverQuotes;
      saveQuotes();
    } else {
      // fallback default quotes
      quotes = [
        { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
        { text: "Life is what happens when you're busy making other plans.", category: "Life" },
        { text: "Get busy living or get busy dying.", category: "Motivation" }
      ];
      saveQuotes();
    }
  }
  populateCategories();
  filterQuotes();
}

// Save quotes locally
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

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  displayQuotes(filteredQuotes);
}

// Display one random quote from array
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

// Show last viewed quote on reload
function showLastViewedQuote() {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    displayQuotes([JSON.parse(lastQuote)]);
  } else {
    filterQuotes();
  }
}

// Add a new quote
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

// Create inputs for adding new quote with icons
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

// Show notification messages (bottom-right corner)
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

// Periodic sync every 30 seconds
setInterval(async () => {
  await syncQuotes();
  const serverQuotes = await fetchQuotesFromServer();
  if (Array.isArray(serverQuotes)) {
    // Server wins on conflict, overwrite local
    quotes = serverQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification("Quotes updated from server.");
  }
}, 30000);

// Event listeners for buttons
document.getElementById("newQuote").addEventListener("click", filterQuotes);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

// Initialization
(async function () {
  await loadQuotes();
  createAddQuoteForm();
  showLastViewedQuote();
})();
