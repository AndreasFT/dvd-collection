// --- Supabase setup ---
const SUPABASE_URL = "https://bnbhfvpmyuynrqcvqrfx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuYmhmdnBteXV5bnJxcmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNDg0NTIsImV4cCI6MjA3NjYyNDQ1Mn0.U2xm2QFpnZTqoQdSVyrl1WcTzyWRR63wMxEsc_04Aw0";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PASSWORD = "Pepito_du_75";
const API_KEY = "195c3a3949d344fb58e20ae881573f55";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// --- DOM Elements ---
const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");
const collectionDiv = document.getElementById("collection");
const searchCollectionInput = document.getElementById("search-collection-input");

const tabSearch = document.getElementById("tab-search");
const tabCollection = document.getElementById("tab-collection");
const searchSection = document.getElementById("search-section");
const collectionSection = document.getElementById("collection-section");

// --- Onglets ---
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

// --- Recherche TMDB ---
let dernierTimeout = null;
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  clearTimeout(dernierTimeout);
  if (query.length < 2) { resultsDiv.innerHTML = ""; return; }

  dernierTimeout = setTimeout(async () => {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&include_adult=false`
    );
    const data = await response.json();
    if (!data.results) return;

    let filmsFiltres = data.results
      .filter(f => f.poster_path && f.overview && f.overview.trim() && f.vote_count > 50)
      .sort((a,b) => b.popularity - a.popularity);

    const vus = new Set();
    filmsFiltres = filmsFiltres.filter(f => {
      const titre = f.title.toLowerCase();
      if (vus.has(titre)) return false;
      vus.add(titre);
      return true;
    });

    afficherResultats(filmsFiltres);
  }, 400);
});

function afficherResultats(films) {
  if(films.length === 0) { resultsDiv.innerHTML="<p>Aucun film trouvé 😢</p>"; return; }

  resultsDiv.innerHTML = films.map(film => `
    <div class="movie-card">
      <img src="${IMG_BASE + film.poster_path}" alt="${film.title}">
      <h3>${film.title}</h3>
      <p>${film.overview}</p>
      <button onclick="ajouterFilmSupabase({id:${film.id}, titre:'${film.title.replace(/'/g,"\\'")}', image:'${film.poster_path}'})">Ajouter</button>
    </div>
  `).join("");
}

// --- Ajouter film ---
async function ajouterFilmSupabase(film) {
  const mdp = prompt("Entrez le mot de passe pour ajouter un film :");
  if (mdp !== PASSWORD) { alert("Mot de passe incorrect ❌"); return; }

  const { data, error } = await supabase
    .from('collection')
    .insert([film]);

  if (error) alert(error.message);
  else afficherCollection(searchCollectionInput.value.trim());
}

// --- Supprimer film ---
async function supprimerFilmSupabase(id) {
  const mdp = prompt("Entrez le mot de passe pour supprimer un film :");
  if (mdp !== PASSWORD) { alert("Mot de passe incorrect ❌"); return; }

  await supabase
    .from('collection')
    .delete()
    .eq('id', id);

  afficherCollection(searchCollectionInput.value.trim());
}

// --- Afficher collection ---
async function afficherCollection(filter="") {
  let { data: collection, error } = await supabase
    .from('collection')
    .select('*');

  if (error) { collectionDiv.innerHTML=`<p>Erreur: ${error.message}</p>`; return; }

  if (filter.length > 0) {
    const lowerFilter = filter.toLowerCase();
    collection = collection.filter(f => f.titre.toLowerCase().includes(lowerFilter));
  }

  collection.sort((a,b) => a.titre.localeCompare(b.titre,'fr',{sensitivity:'base'}));

  if (collection.length === 0) {
    collectionDiv.innerHTML = "<p>Aucun film trouvé dans votre collection 😢</p>";
    return;
  }

  collectionDiv.innerHTML = collection.map(film => `
    <div class="movie-card">
      <img src="${film.image.startsWith('http') ? film.image : IMG_BASE+film.image}" alt="${film.titre}">
      <h3>${film.titre}</h3>
      <button onclick="supprimerFilmSupabase(${film.id})">Supprimer</button>
    </div>
  `).join("");
}

// --- Recherche dans la collection ---
searchCollectionInput.addEventListener("input", () => afficherCollection(searchCollectionInput.value.trim()));
