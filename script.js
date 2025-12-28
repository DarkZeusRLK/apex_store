document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializar ícones do Lucide
  if (typeof lucide !== "undefined") lucide.createIcons();

  // 2. Sistema de Notificação (Toast)
  window.showToast = (message, type = "success") => {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    const icon = type === "success" ? "check-circle" : "alert-circle";
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i data-lucide="${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  };

  // 3. FAQ Toggle
  document.querySelectorAll(".faq-question").forEach((q) => {
    q.addEventListener("click", () =>
      q.parentElement.classList.toggle("active")
    );
  });

  // 4. Reveal ao Scroll
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document
    .querySelectorAll(
      ".reveal, .service-box, .portfolio-item, .review-card, .stat-item"
    )
    .forEach((el) => {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });

  // 5. Cursor Glow
  const glow = document.querySelector(".cursor-glow");
  if (glow) {
    document.addEventListener("mousemove", (e) => {
      requestAnimationFrame(() => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      });
    });
  }

  // 6. Typewriter Effect
  const textElement = document.getElementById("typewriter");
  if (textElement) {
    const words = [
      "Experiência única",
      "Cidade Especial",
      "Projeto Inovador",
      "Alta Performance",
    ];
    let wordIndex = 0,
      charIndex = 0,
      isDeleting = false;
    function type() {
      const currentWord = words[wordIndex];
      textElement.textContent = isDeleting
        ? currentWord.substring(0, charIndex--)
        : currentWord.substring(0, charIndex++);
      let speed = isDeleting ? 50 : 150;
      if (!isDeleting && charIndex > currentWord.length) {
        isDeleting = true;
        speed = 2000;
      } else if (isDeleting && charIndex < 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        speed = 500;
      }
      setTimeout(type, speed);
    }
    type();
  }

  // 7. Stats Counter
  const statsSection = document.querySelector(".stats");
  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          document.querySelectorAll(".counter").forEach((counter) => {
            const target = +counter.getAttribute("data-target");
            let current = 0;
            const update = () => {
              current += target / 100;
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

  // 8. Lógica dos Botões de Serviço (Ajustado para os novos textos das imagens)
  document.querySelectorAll(".btn-text").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const text = btn.innerText.toLowerCase();
      if (text.includes("orçamento")) {
        e.preventDefault();
        openModal("budget");
      } else if (text.includes("consultor") || text.includes("desenvolvedor")) {
        e.preventDefault();
        openModal("dev");
      }
    });
  });
});

// --- FUNÇÕES GLOBAIS ---
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1454889560335974525/MUnAyJE-JYGG54UGcdvHfVKIH-bBJskqOsaIlbm0eGI68RVpbob8Wpgpq1p4WANRfTAs";

function openModal(type) {
  const modal = document.getElementById("modal-orcamento");
  const form = document.getElementById("form-orcamento");
  const devList = document.getElementById("dev-list-container");
  const title = document.getElementById("modal-title");
  const desc = document.getElementById("modal-desc");

  if (type === "budget") {
    form.style.display = "block";
    devList.style.display = "none";
    if (title)
      title.innerHTML = '<i data-lucide="file-text"></i> Solicitar Orçamento';
    if (desc)
      desc.innerText =
        "Preencha os detalhes abaixo e nossa equipe entrará em contato.";
  } else {
    form.style.display = "none";
    devList.style.display = "block";
    if (title) title.innerHTML = '<i data-lucide="code-2"></i> Desenvolvedores';
    if (desc)
      desc.innerText = "Estes são os responsáveis que podem te auxiliar.";
  }
  modal.style.display = "flex";
  if (typeof lucide !== "undefined") lucide.createIcons();
}

// Função global para fechar (chamada pelo botão X no HTML)
window.closeBudgetModal = function () {
  document.getElementById("modal-orcamento").style.display = "none";
};

// 9. Envio do Formulário
const orcamentoForm = document.getElementById("form-orcamento");
if (orcamentoForm) {
  orcamentoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = "Enviando...";

    const payload = {
      content: `🔔 **Nova solicitação de orçamento!** <@&1454877647401386146>`,
      embeds: [
        {
          title: "🚀 Detalhes do Projeto - Apex Store",
          color: 4061156,
          fields: [
            {
              name: "👤 Cliente",
              value: `<@${document.getElementById("discord-id").value}>`,
              inline: true,
            },
            {
              name: "🕒 Prazo",
              value: document.getElementById("prazo").value,
              inline: true,
            },
            {
              name: "💻 Sistema solicitado",
              value: document.getElementById("sistema-alvo").value,
            },
            {
              name: "📝 Funções",
              value: document.getElementById("funcoes").value,
            },
          ],
          footer: { text: "Apex Store | Sistema de Orçamentos" },
          timestamp: new Date(),
        },
      ],
    };

    try {
      const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast("Solicitação enviada com sucesso!");
        e.target.reset();
        closeBudgetModal();
      } else {
        throw new Error();
      }
    } catch (err) {
      showToast("Erro ao enviar para o Discord.", "error");
    } finally {
      btn.disabled = false;
      btn.innerText = "Enviar Solicitação";
    }
  });
}
// Adicione esta função ao final do seu script.js
window.openGallery = function () {
  document.getElementById("modal-galeria").style.display = "flex";
};

window.closeGallery = function () {
  document.getElementById("modal-galeria").style.display = "none";
};

// No listener dos botões, adicione a verificação:
document.querySelectorAll(".btn-text").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const text = btn.innerText.toLowerCase();
    if (text.includes("demonstração")) {
      e.preventDefault();
      openGallery(); // Abre a galeria
    }
  });
});
