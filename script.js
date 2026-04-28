const WHATSAPP_URL = "https://wa.me/5591991157269";

const icons = {
  service: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 3 7v10l9 5 9-5V7zm0 2.3L18.7 8 12 11.7 5.3 8zm-7 5.4 6 3.3v6.7l-6-3.3zm8 10V13l6-3.3v6.7z"/></svg>'
};

const services = [
  ["Compra e Venda de Imóveis", "Intermediação completa para negociar com clareza, segurança e boa leitura de mercado."],
  ["Locação Residencial e Comercial", "Suporte para proprietários e inquilinos, da divulgação ao contrato."],
  ["Venda de Lotes", "Experiência consolidada com lotes pela Valle Empreendimentos e Valle Par."],
  ["Consultoria Imobiliária", "Orientação estratégica para comprar, vender, alugar ou investir melhor."],
  ["Assessoria Jurídica", "Apoio documental para reduzir riscos em todas as etapas da transação."],
  ["Avaliação de Imóveis", "Análise criteriosa de localização, estado, documentação e preço praticado."]
];

const toast = document.getElementById("toast");

function setAppHeight() {
  const viewportHeight = window.visualViewport && window.visualViewport.height
    ? window.visualViewport.height
    : window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3600);
}

function initCounters() {
  const counters = document.querySelectorAll(".counter");
  if (!("IntersectionObserver" in window)) {
    counters.forEach((counter) => {
      const target = Number(counter.dataset.target);
      const isDecimal = counter.dataset.decimal === "true";
      counter.textContent = isDecimal ? (target / 10).toFixed(1) : target;
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = Number(counter.dataset.target);
      const isDecimal = counter.dataset.decimal === "true";
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 70));
      const tick = () => {
        current = Math.min(target, current + step);
        counter.textContent = isDecimal ? (current / 10).toFixed(1) : current;
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
      obs.unobserve(counter);
    });
  }, { threshold: .4 });

  counters.forEach((counter) => observer.observe(counter));
}

function renderServices() {
  const servicesGrid = document.getElementById("servicesGrid");
  servicesGrid.innerHTML = services.map(([title, description]) => `
    <article class="services-card">
      ${icons.service}
      <h3>${title}</h3>
      <p>${description}</p>
    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const mobileQuery = window.matchMedia("(max-width: 767px)");

  const closeMenu = () => {
    toggle.classList.remove("active");
    navMenu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  const openMenu = () => {
    toggle.classList.add("active");
    navMenu.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
  };

  setAppHeight();
  renderServices();
  initCounters();

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 80);
  }, { passive: true });

  window.addEventListener("resize", () => {
    setAppHeight();
    if (!mobileQuery.matches) closeMenu();
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", setAppHeight);
  }

  window.addEventListener("orientationchange", () => {
    window.setTimeout(setAppHeight, 250);
  });

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    expanded ? closeMenu() : openMenu();
  });

  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("menu-open")) return;
    const clickedInsideMenu = navMenu.contains(event.target);
    const clickedToggle = toggle.contains(event.target);
    if (!clickedInsideMenu && !clickedToggle) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.querySelectorAll('.nav-menu a, .footer-grid a[href^="#"], .btn-light, .hero-actions a[href^="#"]').forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.getElementById("contactForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const requiredFields = form.querySelectorAll("[required]");
    let valid = true;

    requiredFields.forEach((field) => {
      const fieldValid = field.checkValidity();
      field.classList.toggle("field-error", !fieldValid);
      if (!fieldValid) valid = false;
    });

    if (!valid) {
      showToast("Preencha os campos obrigatórios corretamente.");
      return;
    }

    const formData = new FormData(form);
    const text = encodeURIComponent(
      `Olá! Meu nome é ${formData.get("nome")}. Interesse: ${formData.get("interesse")}. ${formData.get("mensagem") || "Gostaria de atendimento da C D Brasil Imóveis."}`
    );

    const whatsappTarget = `${WHATSAPP_URL}?text=${text}`;
    const openedWindow = window.open(whatsappTarget, "_blank");
    if (openedWindow) openedWindow.opener = null;

    form.reset();
    showToast("Mensagem enviada! Abrindo o WhatsApp para continuar o atendimento.");

    if (!openedWindow) {
      window.location.href = whatsappTarget;
    }
  });
});
