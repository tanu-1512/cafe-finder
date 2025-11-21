const btn = document.getElementById("findNearby");
const results = document.getElementById("results");
const loader = document.getElementById("loader");
window.currentCafes = []; // store cafes globally

// Your Yelp API key:
const API_KEY = "Pxx516l6YH0XLOcl9Yzxwc5TTJwGZFEVAlmllUEuodp8phpYgCTgxA3XO-wqfALM11bu6bs79EItc-h15B0_q0jNtGDumlqY7X4CoRzNh1hg2p4ch6G3_9vpkuUfaXYx";

btn.addEventListener("click", () => {
  loader.classList.remove("hidden");
  results.innerHTML = "";

  navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true,
  });
});

function error() {
  loader.classList.add("hidden");
  alert("Please allow location access.");
}

async function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  const url = `https://api.yelp.com/v3/businesses/search?term=cafe&latitude=${lat}&longitude=${lon}&radius=2000&limit=20`;

  try {
    const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    displayCafes(data.businesses || []);
  } catch (err) {
    alert("Error fetching cafes.");
  }

  loader.classList.add("hidden");
}

function displayCafes(cafes) {
  results.innerHTML = "";

  const filtered = cafes.filter(c => c.rating && c.rating > 0);
  window.currentCafes = filtered;

  filtered.forEach(cafe => {
    const distance = (cafe.distance / 1000).toFixed(2);

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <button 
        class="fav-btn" 
        data-id="${cafe.id}" 
        onclick="toggleFavorite('${cafe.id}')"
      >🤍</button>

      <img src="${cafe.image_url}" />

      <div class="card-content">
        <h3>${cafe.name}</h3>
        <div class="rating">⭐ ${cafe.rating}</div>
        <p>${cafe.location.address1 || ""}</p>
        <p class="distance">${distance} km away</p>
      </div>
    `;

    results.appendChild(card);
  });

  updateHeartIcons();
}

// ❤️ SAVE OR REMOVE
function toggleFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const cafe = window.currentCafes.find(c => c.id === id);

  if (!cafe) return;

  const exists = favorites.find(f => f.id === id);

  if (exists) {
    favorites = favorites.filter(f => f.id !== id);
    alert("Removed from favorites 💔");
  } else {
    favorites.push({
      id: cafe.id,
      name: cafe.name,
      image: cafe.image_url,
      rating: cafe.rating,
      address: cafe.location.address1
    });
    alert("Saved to favorites ❤️");
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateHeartIcons();
}

// ❤️ UPDATE HEART ICONS
function updateHeartIcons() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  document.querySelectorAll(".fav-btn").forEach(btn => {
    const id = btn.getAttribute("data-id");
    const saved = favorites.find(f => f.id === id);

    if (saved) {
      btn.textContent = "❤️";
      btn.classList.add("saved");
    } else {
      btn.textContent = "🤍";
      btn.classList.remove("saved");
    }
  });
}

// ⭐ SHOW FAVORITES PAGE
document.getElementById("showFavorites").addEventListener("click", () => {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  results.innerHTML = "";

  if (favorites.length === 0) {
    results.innerHTML = "<p>No favorites yet ❤️</p>";
    return;
  }

  favorites.forEach(cafe => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${cafe.image}" />
      <div class="card-content">
        <h3>${cafe.name}</h3>
        <div class="rating">⭐ ${cafe.rating}</div>
        <p>${cafe.address}</p>
      </div>
    `;

    results.appendChild(card);
  });
});