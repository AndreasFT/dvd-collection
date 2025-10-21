const API_KEY = "195c3a3949d344fb58e20ae881573f55"; 
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// Mot de passe
const PASSWORD = "Pepito_du_75";

const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");
const collectionDiv = document.getElementById("collection");
const searchCollectionInput = document.getElementById("search-collection-input");

const tabSearch = document.getElementById("tab-search");
const tabCollection = document.getElementById("tab-collection");
const searchSection = document.getElementById("search-section");
const collectionSection = document.getElementById("collection-section");

// Navigation onglets
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

// Recherche TMDB
let dernierTimeout = null;
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  clearTimeout(dernierTimeout);

  if (query.length < 2) {
    resultsDiv.innerHTML = "";
    return;
  }

  dernierTimeout = setTimeout(async () => {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&include_adult=false`
    );
    const data = await response.json();
    if (!data.results) return;

    let filmsFiltres = data.results
      .filter(film =>
        film.poster_path &&
        film.overview &&
        film.overview.trim().length > 0 &&
        film.vote_count > 50
      )
      .sort((a, b) => b.popularity - a.popularity);

    const vus = new Set();
    filmsFiltres = filmsFiltres.filter(film => {
      const titre = film.title.toLowerCase();
      if (vus.has(titre)) return false;
      vus.add(titre);
      return true;
    });

    afficherResultats(filmsFiltres);
  }, 400);
});

function afficherResultats(films) {
  if (films.length === 0) {
    resultsDiv.innerHTML = "<p>Aucun film trouvé 😢</p>";
    return;
  }

  resultsDiv.innerHTML = films
    .map(film => `
      <div class="movie-card">
        <img src="${IMG_BASE + film.poster_path}" alt="${film.title}">
        <h3>${film.title}</h3>
        <p>${film.overview}</p>
        <button onclick="demanderMotDePasseAjouter(${film.id}, '${film.title.replace(/'/g, "\\'")}', '${film.poster_path}')">Ajouter</button>
      </div>
    `)
    .join("");
}

// Ajouter avec mot de passe
function demanderMotDePasseAjouter(id, titre, image) {
  const mdp = prompt("Entrez le mot de passe pour ajouter un film :");
  if (mdp === PASSWORD) {
    ajouterFilm(id, titre, image);
  } else {
    alert("Mot de passe incorrect ❌");
  }
}

// Supprimer avec mot de passe
function demanderMotDePasseSupprimer(id) {
  const mdp = prompt("Entrez le mot de passe pour supprimer un film :");
  if (mdp === PASSWORD) {
    supprimerFilm(id);
  } else {
    alert("Mot de passe incorrect ❌");
  }
}

// Ajouter un film
function ajouterFilm(id, titre, image) {
  let collection = JSON.parse(localStorage.getItem("maCollection")) || [];
  if (collection.some(f => f.id === id)) {
    alert("Ce film est déjà dans votre collection !");
    return;
  }
  collection.push({ id, titre, image });
  localStorage.setItem("maCollection", JSON.stringify(collection));
  alert("Film ajouté à votre collection !");
  afficherCollection(searchCollectionInput.value.trim());
}

// Afficher collection (tri alphabétique + filtre recherche)
function afficherCollection(filter = "") {
  let collection = JSON.parse(localStorage.getItem("maCollection")) || [];

  if (collection.length === 0) {
    collectionDiv.innerHTML = "<p>Votre collection est vide 😢</p>";
    return;
  }

  // Filtre recherche collection
  if (filter.length > 0) {
    const lowerFilter = filter.toLowerCase();
    collection = collection.filter(film => film.titre.toLowerCase().includes(lowerFilter));
  }

  // Tri alphabétique
  collection.sort((a, b) => a.titre.localeCompare(b.titre, 'fr', { sensitivity: 'base' }));

  collectionDiv.innerHTML = collection
    .map(film => `
      <div class="movie-card">
        <img src="${film.image ? IMG_BASE + film.image : 'https://via.placeholder.com/200x300'}" alt="${film.titre}">
        <h3>${film.titre}</h3>
        <button onclick="demanderMotDePasseSupprimer(${film.id})">Supprimer</button>
      </div>
    `)
    .join("");

  if (collection.length === 0) {
    collectionDiv.innerHTML = "<p>Aucun film trouvé dans votre collection 😢</p>";
  }
}

// Supprimer un film
function supprimerFilm(id) {
  let collection = JSON.parse(localStorage.getItem("maCollection")) || [];
  collection = collection.filter(f => f.id !== id);
  localStorage.setItem("maCollection", JSON.stringify(collection));
  afficherCollection(searchCollectionInput.value.trim());
}
