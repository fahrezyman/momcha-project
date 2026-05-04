// ========== NAVIGATION MENU ==========
const navMenu = document.getElementById("nav-menu");
const navToggle = document.getElementById("nav-toggle");
const navClose = document.getElementById("nav-close");
const navLinks = document.querySelectorAll(".nav-link");

if (navToggle) navToggle.addEventListener("click", () => navMenu.classList.add("show-menu"));
if (navClose) navClose.addEventListener("click", () => navMenu.classList.remove("show-menu"));
navLinks.forEach((link) => link.addEventListener("click", () => navMenu.classList.remove("show-menu")));

// ========== HEADER SCROLL EFFECT ==========
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 50);
});

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

// ========== SCROLL ANIMATIONS ==========
const animateObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("is-visible"), i * 80);
        animateObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll("[data-animate]").forEach((el) => animateObserver.observe(el));

// ========== CAROUSEL ==========
function initCarousel(totalCards) {
  const track = document.getElementById("services-container");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  const dotsContainer = document.getElementById("carousel-dots");

  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  function getCardStep() {
    const card = track.querySelector(".service-card");
    if (!card) return 344;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    return card.offsetWidth + gap;
  }

  function getCurrentIndex() {
    return Math.round(track.scrollLeft / getCardStep());
  }

  function updateUI() {
    const current = getCurrentIndex();
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.offsetWidth - 2;

    prevBtn.classList.toggle("hidden", atStart);
    nextBtn.classList.toggle("hidden", atEnd);

    dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
    });
  }

  // Build dots
  dotsContainer.innerHTML = "";
  for (let i = 0; i < totalCards; i++) {
    const dot = document.createElement("button");
    dot.className = "carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Layanan ${i + 1}`);
    dot.addEventListener("click", () => {
      track.scrollTo({ left: i * getCardStep(), behavior: "smooth" });
    });
    dotsContainer.appendChild(dot);
  }

  prevBtn.addEventListener("click", () => {
    track.scrollBy({ left: -getCardStep(), behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    track.scrollBy({ left: getCardStep(), behavior: "smooth" });
  });

  // Keyboard navigation when focused inside carousel
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") track.scrollBy({ left: -getCardStep(), behavior: "smooth" });
    if (e.key === "ArrowRight") track.scrollBy({ left: getCardStep(), behavior: "smooth" });
  });

  track.addEventListener("scroll", updateUI, { passive: true });
  window.addEventListener("resize", updateUI);

  updateUI();
}

// ========== SERVICES ==========
const servicesContainer = document.getElementById("services-container");
const servicesLoading = document.getElementById("services-loading");
const servicesError = document.getElementById("services-error");
const carouselWrapper = document.getElementById("carousel-wrapper");

function setServicesState(state) {
  servicesLoading.style.display = state === "loading" ? "block" : "none";
  servicesError.style.display = state === "error" ? "block" : "none";
  carouselWrapper.style.display = state === "done" ? "block" : "none";
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
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
    initCarousel(data.length);
  } catch (error) {
    console.error("Error fetching services:", error);
    setServicesState("error");
  }
}

document.addEventListener("DOMContentLoaded", fetchServices);
