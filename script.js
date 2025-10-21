const API_KEY = "195c3a3949d344fb58e20ae881573f55"; // 🔑 Remplace ici par ta clé TMDB
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");
const collectionDiv = document.getElementById("collection");

const tabSearch = document.getElementById("tab-search");
const tabCollection = document.getElementById("tab-collection");
const searchSection = document.getElementById("search-section");
const collectionSection = document.getElementById("collection-section");

// --- Navigation entre les onglets ---
tabSearch.addEventListener("click", () => {
  tabSearch.classList.add("active");
  tabCollection.classList.remove("active");
  searchSection.style.display = "block";
  collectionSection.style.display = "none";
});

tabCollection.addEventListener("click", () => {
  tabCollection.classList.add("active");
  tabSearch.classList.remove("active");
  searchSection.style.display = "none";
  collectionSection.style.display = "block";
  afficherCollection();
});

// --- Recherche de films ---
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  if (query.length < 2) {
    resultsDiv.innerHTML = "";
    return;
  }

  const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=fr-FR&query=${query}`);
  const data = await response.json();

  resultsDiv.innerHTML = data.results
    .map(film => `
      <div class="movie-card">
        <img src="${film.poster_path ? IMG_BASE + film.poster_path : 'https://via.placeholder.com/200x300'}" alt="${film.title}">
        <h3>${film.title}</h3>
        <p>${film.overview || "Aucune description disponible."}</p>
        <button onclick="ajouterFilm(${film.id}, '${film.title.replace(/'/g, "\\'")}', '${film.poster_path}')">Ajouter</button>
      </div>
    `)
    .join("");
});

// --- Ajouter un film à la collection ---
function ajouterFilm(id, titre, image) {
  let collection = JSON.parse(localStorage.getItem("maCollection")) || [];

  if (collection.some(f => f.id === id)) {
    alert("Ce film est déjà dans votre collection !");
    return;
  }

  collection.push({ id, titre, image });
  localStorage.setItem("maCollection", JSON.stringify(collection));
  alert("Film ajouté à votre collection !");
}

// --- Afficher la collection ---
function afficherCollection() {
  let collection = JSON.parse(localStorage.getItem("maCollection")) || [];

  if (collection.length === 0) {
    collectionDiv.innerHTML = "<p>Votre collection est vide 😢</p>";
    return;
  }

  collectionDiv.innerHTML = collection
    .map(film => `
      <div class="movie-card">
        <img src="${film.image ? IMG_BASE + film.image : 'https://via.placeholder.com/200x300'}" alt="${film.titre}">
        <h3>${film.titre}</h3>
        <button onclick="supprimerFilm(${film.id})">Supprimer</button>
      </div>
    `)
    .join("");
}

// --- Supprimer un film ---
function supprimerFilm(id) {
  let collection = JSON.parse(localStorage.getItem("maCollection")) || [];
  collection = collection.filter(f => f.id !== id);
  localStorage.setItem("maCollection", JSON.stringify(collection));
  afficherCollection();
}
