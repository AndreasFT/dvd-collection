const API_KEY = "195c3a3949d344fb58e20ae881573f55"; 
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// 🔑 Mot de passe hashé (SHA-256) de "Pepito_du_75"
const HASHED_PASSWORD = "36f7b0c0a0383c0f37b0c3f79974b5c4f6760c71c1eaf1cd69ed172e539e7f68";

const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");
const collectionDiv = document.getElementById("collection");

const tabSearch = document.getElementById("tab-search");
const tabCollection = document.getElementById("tab-collection");
const searchSection = document.getElementById("search-section");
const collectionSection = document.getElementById("collection-section");

// --- Navigation ---
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

// --- Recherche ---
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
        <button onclick="demanderMotDePasseAjouter('${film.id}', '${film.title.replace(/'/g, "\\'")}', '${film.poster_path}')">Ajouter</button>
      </div>
    `)
    .join("");
}

// --- Hash SHA-256 ---
async function hashMotDePasse(mot) {
  const encoder = new TextEncoder();
  const data = encoder.encode(mot);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Ajouter avec mot de passe ---
async function demanderMotDePasseAjouter(id, titre, image) {
  const mdp = prompt("Entrez le mot de passe pour ajouter un film :");
  if (!mdp) return;
  const hash = await hashMotDePasse(mdp);
  if (hash === HASHED_PASSWORD) {
    ajouterFilm(id, titre, image);
  } else {
    alert("Mot de passe incorrect ❌");
  }
}

// --- Supprimer avec mot de passe ---
async function demanderMotDePasseSupprimer(id) {
  const mdp = prompt("Entrez le mot de passe pour supprimer un film :");
  if (!mdp) return;
  const hash = await hashMotDePasse(mdp);
  if (hash === HASHED_PASSWORD) {
    supprimerFilm(id);
  } else {
    alert("Mot de passe incorrect ❌");
  }
}

// --- Ajouter un film ---
function ajouterFilm(id, titre, image) {
  let collection = JSON.parse(localStorage.getItem("maCollection")) || [];
  if (collection.some(f => f.id === id)) {
    alert("Ce film est déjà dans votre collection !");
    return;
  }
  collection.push({ id, titre, image });
  localStorage.setItem("maCollection", JSON.stringify(collection));
  alert("Film ajouté à votre collection !");
  afficherCollection();
}

// --- Afficher la collection (tri alphabétique) ---
function afficherCollection() {
  let collection = JSON.parse(localStorage.getItem("maCollection")) || [];

  if (collection.length === 0) {
    collectionDiv.innerHTML = "<p>Votre collection est vide 😢</p>";
    return;
  }

  // 🔹 Tri alphabétique
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
}

// --- Supprimer un film ---
function supprimerFilm(id) {
  let collection = JSON.parse(localStorage.getItem("maCollection")) || [];
  collection = collection.filter(f => f.id !== id);
  localStorage.setItem("maCollection", JSON.stringify(collection));
  afficherCollection();
}
