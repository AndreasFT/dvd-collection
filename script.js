/* 🧠 --- LOGIQUE JAVASCRIPT --- */

// Clé API TMDB (à remplacer par la tienne)
const API_KEY = "195c3a3949d344fb58e20ae881573f55"; // <-- Mets ta clé ici
const BASE_URL = "https://api.themoviedb.org/3"; // URL de base de TMDB

// Récupération des éléments HTML
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");
const loadingDiv = document.getElementById("loading");

function getCollection() {
    if (!currentUser) return [];
    const users = getUsers();
    return users[currentUser]?.collection || [];
  }
  
  function saveCollection(collection) {
    if (!currentUser) return;
    const users = getUsers();
    users[currentUser].collection = collection;
    saveUsers(users);
  }
  

// --- FONCTION : Ajouter un film à la collection ---
function addToCollection(movie) {
  const collection = getCollection();

  // Vérifie si le film est déjà dans la collection
  const exists = collection.some((m) => m.id === movie.id);
  if (exists) {
    alert("🎬 Ce film est déjà dans ta collection !");
    return;
  }

  collection.push(movie);
  saveCollection(collection);
  alert(`✅ "${movie.title}" a été ajouté à ta collection !`);
}

// --- FONCTION PRINCIPALE : Recherche de films ---
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // empêche le rechargement de la page

  const query = input.value.trim();
  if (!query) return;

  resultsDiv.innerHTML = "";
  loadingDiv.style.display = "block";

  try {
    // Appel à l’API TMDB
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=fr-FR`
    );
    const data = await response.json();

    // Si aucun film trouvé
    if (data.results.length === 0) {
      resultsDiv.innerHTML = "<p>Aucun film trouvé.</p>";
    } else {
      // Affichage de chaque film
      data.results.forEach((movie) => {
        const movieDiv = document.createElement("div");
        movieDiv.classList.add("movie");

        const imageUrl = movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "https://via.placeholder.com/300x450?text=Pas+d'image";

        // Création du HTML du film
        movieDiv.innerHTML = `
          <img src="${imageUrl}" alt="${movie.title}" />
          <h2>${movie.title}</h2>
          <p>${movie.overview || "Aucune description disponible."}</p>
          <button class="add-btn">➕ Ajouter le DVD</button>
        `;

        // Quand on clique sur "Ajouter le DVD"
        const addButton = movieDiv.querySelector(".add-btn");
        addButton.addEventListener("click", () => addToCollection(movie));

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

// --- 🌐 Gestion des onglets --- //
const tabSearch = document.getElementById("tab-search");
const tabCollection = document.getElementById("tab-collection");
const searchSection = document.getElementById("search-section");
const collectionSection = document.getElementById("collection-section");
const collectionList = document.getElementById("collection-list");

// Fonction pour afficher la collection
function displayCollection() {
  const collection = getCollection();

  if (collection.length === 0) {
    collectionList.innerHTML = "<p>Ta collection est vide 😢</p>";
    return;
  }

  collectionList.innerHTML = "";
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

    // bouton supprimer
    div.querySelector(".remove-btn").addEventListener("click", () => {
      removeFromCollection(movie.id);
      displayCollection();
    });

    collectionList.appendChild(div);
  });
}

// Supprime un film de la collection
function removeFromCollection(id) {
  let collection = getCollection();
  collection = collection.filter((movie) => movie.id !== id);
  saveCollection(collection);
}

// Onglet “Chercher un DVD”
tabSearch.addEventListener("click", () => {
  searchSection.style.display = "block";
  collectionSection.style.display = "none";
  tabSearch.classList.add("active");
  tabCollection.classList.remove("active");
});

// Onglet “Ma collection”
tabCollection.addEventListener("click", () => {
  searchSection.style.display = "none";
  collectionSection.style.display = "block";
  tabCollection.classList.add("active");
  tabSearch.classList.remove("active");

  // Affiche la collection enregistrée
  displayCollection();
});

/* --- SYSTEME DE COMPTE SIMPLE --- */

// Utilisateur actuellement connecté
let currentUser = null;

// Récupération des éléments
const loginSection = document.getElementById("login-section");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");

const navbar = document.getElementById("navbar");
const logoutBtn = document.getElementById("logout-btn");

// Fonction pour récupérer les utilisateurs depuis localStorage
function getUsers() {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : {};
}

// Fonction pour sauvegarder les utilisateurs
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Login / inscription
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (!username) return;

  let users = getUsers();

  // Si l'utilisateur n'existe pas, on le crée
  if (!users[username]) {
    users[username] = {
      collection: []
    };
    saveUsers(users);
    alert(`👋 Bienvenue ${username}, votre compte a été créé !`);
  } else {
    alert(`👋 Bienvenue de retour ${username} !`);
  }

  // On définit l'utilisateur courant
  currentUser = username;

  // Affiche la navigation et les sections
  loginSection.style.display = "none";
  navbar.style.display = "flex";
  searchSection.style.display = "block";

  // Reset barre recherche
  usernameInput.value = "";

  // Rafraîchir la collection
  displayCollection();
});

// Déconnexion
logoutBtn.addEventListener("click", () => {
  currentUser = null;
  // Cacher sections
  loginSection.style.display = "block";
  navbar.style.display = "none";
  searchSection.style.display = "none";
  collectionSection.style.display = "none";
});
