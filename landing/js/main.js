// ========== NAVIGATION MENU ==========
const navMenu = document.getElementById("nav-menu");
const navToggle = document.getElementById("nav-toggle");
const navClose = document.getElementById("nav-close");
const navLinks = document.querySelectorAll(".nav-link");

// Show menu
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu");
  });
}

// Hide menu
if (navClose) {
  navClose.addEventListener("click", () => {
    navMenu.classList.remove("show-menu");
  });
}

// Hide menu when clicking nav link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("show-menu");
  });
});

// ========== ACTIVE LINK ON SCROLL ==========
const sections = document.querySelectorAll("section[id]");

function scrollActive() {
  const scrollY = window.pageYOffset;

  sections.forEach((section) => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute("id");
    const link = document.querySelector(`.nav-link[href*=${sectionId}]`);

    if (link) {
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        link.classList.add("active-link");
      } else {
        link.classList.remove("active-link");
      }
    }
  });
}

window.addEventListener("scroll", scrollActive);

// ========== SCROLL UP BUTTON ==========
const scrollUp = document.getElementById("scroll-up");

function showScrollUp() {
  if (window.scrollY >= 350) {
    scrollUp.classList.add("show-scroll");
  } else {
    scrollUp.classList.remove("show-scroll");
  }
}

window.addEventListener("scroll", showScrollUp);

// ========== FETCH SERVICES FROM API ==========
const servicesContainer = document.getElementById("services-container");
const servicesLoading = document.getElementById("services-loading");
const servicesError = document.getElementById("services-error");

// API Base URL - UPDATE THIS TO YOUR ACTUAL API URL
const API_BASE_URL = "http://localhost:4000/api";
// For development/testing, use: const API_BASE_URL = 'http://localhost:4000/api';

async function fetchServices() {
  try {
    const response = await fetch(`${API_BASE_URL}/services`);

    if (!response.ok) {
      throw new Error("Failed to fetch services");
    }

    const data = await response.json();

    if (data.success && data.data && data.data.length > 0) {
      displayServices(data.data);
    } else {
      throw new Error("No services found");
    }
  } catch (error) {
    console.error("Error fetching services:", error);
    showError();
  } finally {
    hideLoading();
  }
}

function displayServices(services) {
  servicesContainer.innerHTML = "";

  services.forEach((service) => {
    const serviceCard = createServiceCard(service);
    servicesContainer.appendChild(serviceCard);
  });
}

function createServiceCard(service) {
  const card = document.createElement("div");
  card.className = "service-card";

  // Format price to Indonesian Rupiah
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(service.price);

  // Convert minutes to hours if >= 60
  let durationText;
  if (service.duration_minutes >= 60) {
    const hours = Math.floor(service.duration_minutes / 60);
    const minutes = service.duration_minutes % 60;
    durationText = minutes > 0 ? `${hours}j ${minutes}m` : `${hours} jam`;
  } else {
    durationText = `${service.duration_minutes} menit`;
  }

  // Service icon (customize based on service type)
  const icon = getServiceIcon(service.name);

  card.innerHTML = `
        <div class="service-icon">${icon}</div>
        <h3>${service.name}</h3>
        <p>${service.description || "Layanan perawatan profesional untuk ibu dan bayi"}</p>
        <div class="service-info">
            <span class="service-price">${formattedPrice}</span>
            <span class="service-duration">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${durationText}
            </span>
        </div>
    `;

  return card;
}

function getServiceIcon(serviceName) {
  const name = serviceName.toLowerCase();

  if (name.includes("massage") || name.includes("pijat")) {
    return "💆";
  } else if (name.includes("jaga") || name.includes("baby")) {
    return "👶";
  } else if (name.includes("konsultasi")) {
    return "💬";
  } else if (name.includes("laktasi") || name.includes("asi")) {
    return "🤱";
  } else {
    return "🍼";
  }
}

function hideLoading() {
  servicesLoading.style.display = "none";
}

function showError() {
  servicesError.style.display = "block";
  servicesContainer.innerHTML = "";
}

// Load services when page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchServices();
});
