let quotes = [];

// Load quotes from localStorage or defaults
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Get busy living or get busy dying.", category: "Motivation" }
    ];
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))]; // unique categories

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore saved filter from localStorage if exists
  const savedFilter = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedFilter;
}

// Display quotes based on selected filter
function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;

  localStorage.setItem("selectedCategory", selectedCategory); // Save preference

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  displayQuotes(filteredQuotes);
}

// Display quotes helper - show one random quote from array
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

// Show last viewed quote or filtered on load
function showLastViewedQuote() {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    displayQuotes([quote]);
  } else {
    filterQuotes();
  }
}

// Add new quote (update categories and refresh display)
function addQuote() {
  const textInput = document.getElementById("newQuoteText").value.trim();
  const categoryInput = document.getElementById("newQuoteCategory").value.trim();

  if (!textInput || !categoryInput) {
    alert("Please enter both a quote and category.");
    return;
  }

  quotes.push({ text: textInput, category: categoryInput });
  saveQuotes();

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Refresh categories dropdown and display
  populateCategories();

  // Show filtered quotes after adding
  const currentFilter = document.getElementById("categoryFilter").value;
  if (currentFilter === categoryInput || currentFilter === "all") {
    filterQuotes();
  }

  alert("Quote added successfully!");
}

// Create inputs with icons inside #formContainer
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
  fileReader.onload = function(e) {
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

// DOM references
const newQuoteBtn = document.getElementById("newQuote");

// Initialize app
loadQuotes();
createAddQuoteForm();
populateCategories();
showLastViewedQuote();

newQuoteBtn.addEventListener("click", filterQuotes);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
