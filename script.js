// Aguarda o DOM carregar completamente
document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializar ícones do Lucide
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // 2. FAQ Toggle com Animação
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
      const item = question.parentElement;
      item.classList.toggle("active");
    });
  });

  // 3. Lógica de Revelação ao Scroll (Intersection Observer)
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px",
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        // Para de observar após animar (performance)
        revealObserver.unobserve(entry.target);
      }
    });
  }, revealOptions);

  // Garante que todos os elementos importantes tenham a classe 'reveal'
  const elementsToReveal = document.querySelectorAll(
    ".reveal, .service-card, .portfolio-item, .review-card, .stat-item, .section-header"
  );

  elementsToReveal.forEach((el) => {
    el.classList.add("reveal"); // Adiciona se não tiver
    revealObserver.observe(el);
  });

  // 4. Cursor Glow (Brilho do Mouse)
  const glow = document.querySelector(".cursor-glow");
  if (glow) {
    document.addEventListener("mousemove", (e) => {
      // Usa requestAnimationFrame para movimento mais suave
      requestAnimationFrame(() => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      });
    });
  }

  // 5. Contadores Animados (Stats)
  const statsSection = document.querySelector(".stats");
  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          document.querySelectorAll(".counter").forEach((counter) => {
            const target = +counter.getAttribute("data-target");
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const update = () => {
              current += step;
              if (current < target) {
                counter.innerText = Math.floor(current);
                requestAnimationFrame(update);
              } else {
                counter.innerText = target + "+";
              }
            };
            update();
          });
          statsObserver.unobserve(statsSection);
        }
      },
      { threshold: 0.5 }
    );

    statsObserver.observe(statsSection);
  }
});
