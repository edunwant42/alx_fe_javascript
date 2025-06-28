# 💬 Dynamic Quote Generator

This project is a dynamic, interactive Quote Generator built using **HTML, CSS, and JavaScript**. It features advanced DOM manipulation, category filtering, local and session storage usage, and real-time syncing with a mock server API.

## 🚀 Features

- ✅ Add your own motivational, inspirational, or fun quotes
- ✅ Filter quotes by category
- ✅ Display a random quote from selected category
- ✅ Persist quotes using LocalStorage
- ✅ Show last viewed quote using SessionStorage
- ✅ Export and import quotes as JSON files
- ✅ Periodic sync with mock server (`JSONPlaceholder`)
- ✅ Simulated conflict resolution (server wins)
- ✅ User notifications for sync status and errors

## 🛠️ Technologies Used

- HTML5
- CSS3 (FontAwesome for icons)
- JavaScript (Vanilla)
- JSONPlaceholder (as a fake REST API)
- LocalStorage and SessionStorage

## 📁 Project Structure

```
├── index.html # Main HTML file
├── style.css # Styling file (not required)
├── script.js # JavaScript logic
└── sample-quotes.json # Sample JSON data (for import/export)
```

## 📖 Usage

1. Clone the repository:

   ```bash
   git clone git@github.com:edunwant42/alx_fe_javascript.git
   ```

2. Open `index.html` in your browser.

3. Use the interface to add, filter, and view quotes.


## 🔄 Server Sync Simulation

The app fetches quotes from:
- `https://jsonplaceholder.typicode.com/posts` (simulated as a quote source)

Quotes are fetched, mapped, and used to simulate real API interaction.
- Title → `text`
- Body → `category` (categorized by length)

Every 30 seconds, the app syncs:
1. Fetches latest quotes from the server
2. Replaces local quotes (server wins)
3. Sends quotes back to the server via a `POST` request

## 📦 How to Use

1. Clone or download this repo
2. Open `index.html` in your browser
3. Add, filter, or view quotes
4. Import/export via JSON
5. Check your browser console or bottom-right of screen for sync notifications

## 💡 Future Enhancements

- Conflict resolution with user options (keep local vs server)
- Categorized quote analytics
- Improved UI/UX with animations

## 🧑‍💻 Author

- **Edunwant42**  
- ALX Front-End JavaScript Project  
- June 2025
