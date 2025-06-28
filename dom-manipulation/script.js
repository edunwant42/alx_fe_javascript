let quotes = [];
const SERVER_URL = "https://mocki.io/v1/9dba4b6e-bde4-4811-afee-a48099e2e0e5";

// Load from localStorage or fetch from server
async function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    await syncWithServer();
  }
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Sync with server (fetch only - mock API)
async function syncWithServer() {
  try {
    const res = await fetch(SERVER_URL);
    const serverQuotes = await res.json();

    if (Array.isArray(serverQuotes)) {
      // Server wins in conflict: overwrite local
      quotes = serverQuotes;
      saveQuotes();
      populateCategories();
      filterQuotes();
      showNotification("Quotes synced with server.");
    } else {
      console.warn("Invalid server data.");
    }
  } catch (error) {
    console.error("Server sync failed:", error);
    showNotification("Failed to sync with server.");
  }
}

// Periodic sync every 30 seconds
setInterval(syncWithServer, 30000);

// Populate categories
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

// Filter quotes
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  displayQuotes(filteredQuotes);
}

// Show a random quote
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

// Input fields for adding quotes
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

// Export to JSON file
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

// Import from JSON file
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

// Show update/sync notifications
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

// Setup
document.getElementById("newQuote").addEventListener("click", filterQuotes);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

// Init
(async function () {
  await loadQuotes();
  createAddQuoteForm();
  populateCategories();
  showLastViewedQuote();
})();
