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

// Display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>Category: ${quote.category}</small>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Show last viewed quote from sessionStorage or show random
function showLastViewedQuote() {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>Category: ${quote.category}</small>`;
  } else {
    showRandomQuote();
  }
}

// Add new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText").value.trim();
  const categoryInput = document.getElementById("newQuoteCategory").value.trim();

  if (!textInput || !categoryInput) {
    alert("Please enter both a quote and category.");
    return;
  }

  const newQuote = { text: textInput, category: categoryInput };
  quotes.push(newQuote);
  saveQuotes();

  // Show the newly added quote immediately
  quoteDisplay.innerHTML = `<p>"${newQuote.text}"</p><small>Category: ${newQuote.category}</small>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(newQuote));

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// Create inputs with icons
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
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Failed to import JSON.");
    }
    event.target.value = ''; // clear file input after import
  };
  fileReader.readAsText(event.target.files[0]);
}

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Initialize app
loadQuotes();
createAddQuoteForm();
showLastViewedQuote();

newQuoteBtn.addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
