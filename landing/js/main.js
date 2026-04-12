// ========== NAVIGATION MENU ==========
const navMenu = document.getElementById("nav-menu");
const navToggle = document.getElementById("nav-toggle");
const navClose = document.getElementById("nav-close");
const navLinks = document.querySelectorAll(".nav-link");

if (navToggle) navToggle.addEventListener("click", () => navMenu.classList.add("show-menu"));
if (navClose) navClose.addEventListener("click", () => navMenu.classList.remove("show-menu"));
navLinks.forEach((link) => link.addEventListener("click", () => navMenu.classList.remove("show-menu")));

// ========== ACTIVE LINK ON SCROLL ==========
const sections = document.querySelectorAll("section[id]");

function scrollActive() {
  const scrollY = window.pageYOffset;
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute("id");
    const link = document.querySelector(`.nav-link[href*=${sectionId}]`);
    if (!link) return;
    link.classList.toggle("active-link", scrollY > sectionTop && scrollY <= sectionTop + section.offsetHeight);
  });
}

window.addEventListener("scroll", scrollActive);

// ========== SCROLL UP BUTTON ==========
const scrollUp = document.getElementById("scroll-up");
window.addEventListener("scroll", () => scrollUp.classList.toggle("show-scroll", window.scrollY >= 350));

// ========== SERVICES ==========
const servicesContainer = document.getElementById("services-container");
const servicesLoading = document.getElementById("services-loading");
const servicesError = document.getElementById("services-error");

function setServicesState(state) {
  servicesLoading.style.display = state === "loading" ? "block" : "none";
  servicesError.style.display = state === "error" ? "block" : "none";
}

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}j ${mins}m` : `${hours} jam`;
}

function getServiceIcon(name) {
  const n = name.toLowerCase();
  if (n.includes("massage") || n.includes("pijat")) return "💆";
  if (n.includes("jaga") || n.includes("baby")) return "👶";
  if (n.includes("konsultasi")) return "💬";
  if (n.includes("laktasi") || n.includes("asi")) return "🤱";
  return "🍼";
}

function createServiceCard({ name, description, price, duration_minutes }) {
  const card = document.createElement("div");
  card.className = "service-card";
  card.innerHTML = `
    <div class="service-icon">${getServiceIcon(name)}</div>
    <h3>${name}</h3>
    <p>${description || "Layanan perawatan profesional untuk ibu dan bayi"}</p>
    <div class="service-info">
      <span class="service-price">${formatPrice(price)}</span>
      <span class="service-duration">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        ${formatDuration(duration_minutes)}
      </span>
    </div>
  `;
  return card;
}

async function fetchServices() {
  setServicesState("loading");
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/services`);
    if (!response.ok) throw new Error("Failed to fetch services");
    const { success, data } = await response.json();
    if (!success || !data?.length) throw new Error("No services found");
    servicesContainer.innerHTML = "";
    data.forEach((service) => servicesContainer.appendChild(createServiceCard(service)));
    setServicesState("done");
  } catch (error) {
    console.error("Error fetching services:", error);
    setServicesState("error");
  }
}

document.addEventListener("DOMContentLoaded", fetchServices);
