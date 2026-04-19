// SCROLL REVEAL COM ATIVAÇÃO MAIS RÁPIDA
const elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      // Opcional: para a animação só acontecer uma vez
      // observer.unobserve(entry.target);
    }
  });
}, { 
  threshold: 0.1, // Começa a animar quando 10% do item aparece
  rootMargin: "0px 0px -50px 0px" // Trigger ligeiramente antes de entrar totalmente
});

elements.forEach(el => observer.observe(el));

// PARALLAX HERO SUAVE
window.addEventListener("scroll", () => {
  const bg = document.querySelector(".hero-bg");
  let scroll = window.scrollY;
  // requestAnimationFrame para performance
  window.requestAnimationFrame(() => {
    bg.style.transform = `translateY(${scroll * 0.3}px)`;
  });
});