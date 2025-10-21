/* =================== CONFIGURATION =================== */

// Clé API TMDB
const API_KEY = "195c3a3949d344fb58e20ae881573f55";
const BASE_URL = "https://api.themoviedb.org/3";

/* =================== ELEMENTS HTML =================== */
const loginSection = document.getElementById("login-section");
const navbar = document.getElementById("navbar");
const searchSection = document.getElementById("search-section");
const collectionSection = document.getElementById("collection-section");
const collectionList = document.getElementById("collection-list");

const tabSearch = document.getElementById("tab-search");
const tabCollection = document.getElementById("tab-collection");
const logoutBtn = document.getElementById("logout-btn");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");
const loadingDiv = document.getElementById("loading");

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");

/* =================== UTILISATEUR =================== */
let currentUser = null; // email
let users = JSON.parse(localStorage.getItem("users")) || {}; // stockage local des comptes

/* =================== INSCRIPTION =================== */
registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const avatar = document.getElementById("register-avatar").value.trim() || "https://via.placeholder.com/100";

    if (users[email]) {
        alert("⚠️ Cet email est déjà utilisé !");
        return;
    }

    users[email] = { username, email, password, avatar, collection: [] };
    localStorage.setItem("users", JSON.stringify(users));

    alert("✅ Compte créé !");
    registerForm.reset();
});

/* =================== CONNEXION =================== */
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!users[email] || users[email].password !== password) {
        alert("❌ Identifiants incorrects !");
        return;
    }

    currentUser = email;
    loginSection.style.display = "none";
    navbar.style.display = "flex";
    searchSection.style.display = "block";

    displayCollection();
});

/* =================== DECONNEXION =================== */
logoutBtn.addEventListener("click", () => {
    currentUser = null;
    loginSection.style.display = "block";
    navbar.style.display = "none";
    searchSection.style.display = "none";
    collectionSection.style.display = "none";
});

/* =================== COLLECTION (LocalStorage) =================== */
function getCollection() {
    if (!currentUser) return [];
    return users[currentUser].collection || [];
}

function saveCollection(collection) {
    if (!currentUser) return;
    users[currentUser].collection = collection;
    localStorage.setItem("users", JSON.stringify(users));
}

function addToCollection(movie) {
    let collection = getCollection();
    if (collection.some(m => m.id === movie.id)) {
        alert("🎬 Ce film est déjà dans ta collection !");
        return;
    }
    collection.push(movie);
    saveCollection(collection);
    alert(`✅ "${movie.title}" a été ajouté à ta collection !`);
    displayCollection();
}

function removeFromCollection(id) {
    let collection = getCollection();
    collection = collection.filter(m => m.id !== id);
    saveCollection(collection);
    displayCollection();
}

function displayCollection() {
    const collection = getCollection();
    collectionList.innerHTML = "";

    if (collection.length === 0) {
        collectionList.innerHTML = "<p>Ta collection est vide 😢</p>";
        return;
    }

    collection.forEach((movie) => {
        const div = document.createElement("div");
        div.classList.add("movie");
        const imageUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://via.placeholder.com/300x450?text=Pas+d'image";

        div.innerHTML = `
            <img src="${imageUrl}" alt="${movie.title}" />
            <h2>${movie.title}</h2>
            <p>${movie.overview || "Aucune description disponible."}</p>
            <button class="remove-btn">🗑️ Supprimer</button>
        `;

        div.querySelector(".remove-btn").addEventListener("click", () => removeFromCollection(movie.id));
        collectionList.appendChild(div);
    });
}

/* =================== ONGLETS =================== */
tabSearch.addEventListener("click", () => {
    searchSection.style.display = "block";
    collectionSection.style.display = "none";
    tabSearch.classList.add("active");
    tabCollection.classList.remove("active");
});

tabCollection.addEventListener("click", () => {
    searchSection.style.display = "none";
    collectionSection.style.display = "block";
    tabCollection.classList.add("active");
    tabSearch.classList.remove("active");
    displayCollection();
});

/* =================== RECHERCHE TMDB =================== */
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    resultsDiv.innerHTML = "";
    loadingDiv.style.display = "block";

    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=fr-FR`);
        const data = await response.json();

        if (data.results.length === 0) {
            resultsDiv.innerHTML = "<p>Aucun film trouvé.</p>";
        } else {
            data.results.forEach((movie) => {
                const movieDiv = document.createElement("div");
                movieDiv.classList.add("movie");
                const imageUrl = movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://via.placeholder.com/300x450?text=Pas+d'image";

                movieDiv.innerHTML = `
                    <img src="${imageUrl}" alt="${movie.title}" />
                    <h2>${movie.title}</h2>
                    <p>${movie.overview || "Aucune description disponible."}</p>
                    <button class="add-btn">➕ Ajouter le DVD</button>
                `;

                movieDiv.querySelector(".add-btn").addEventListener("click", () => addToCollection(movie));
                resultsDiv.appendChild(movieDiv);
            });
        }
    } catch (error) {
        console.error("Erreur:", error);
        resultsDiv.innerHTML = "<p>Une erreur est survenue.</p>";
    } finally {
        loadingDiv.style.display = "none";
    }
});
