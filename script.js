const burger = document.querySelector(".burger");
const mobileMenu = document.querySelector(".mobile-menu");
const navLinks = document.querySelectorAll('a[href^="#"]');
const faqItems = document.querySelectorAll(".faq-item");
const cursorGlow = document.querySelector(".cursor-glow");

const closeMenu = () => {
  document.body.classList.remove("menu-open");
  burger?.classList.remove("is-active");
  mobileMenu?.classList.remove("is-open");
  burger?.setAttribute("aria-expanded", "false");
  burger?.setAttribute("aria-label", "Открыть меню");
};

burger?.addEventListener("click", () => {
  const isOpen = burger.classList.toggle("is-active");

  document.body.classList.toggle("menu-open", isOpen);
  mobileMenu?.classList.toggle("is-open", isOpen);
  burger.setAttribute("aria-expanded", String(isOpen));
  burger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  question?.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    faqItems.forEach((currentItem) => {
      const currentQuestion = currentItem.querySelector(".faq-question");
      const currentAnswer = currentItem.querySelector(".faq-answer");

      currentItem.classList.remove("is-open");
      currentQuestion?.setAttribute("aria-expanded", "false");

      if (currentAnswer) {
        currentAnswer.style.maxHeight = "0px";
      }
    });

    if (!isOpen && answer) {
      item.classList.add("is-open");
      question.setAttribute("aria-expanded", "true");
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

window.addEventListener("resize", () => {
  document.querySelectorAll(".faq-item.is-open .faq-answer").forEach((answer) => {
    answer.style.maxHeight = `${answer.scrollHeight}px`;
  });
});

window.addEventListener("load", () => {
  const targetId = window.location.hash.slice(1);
  const target = targetId ? document.getElementById(targetId) : null;

  target?.scrollIntoView({ block: "start" });
});

const setupCursorGlow = () => {
  if (!cursorGlow) {
    return;
  }

  const canUseGlow =
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(min-width: 901px)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canUseGlow) {
    cursorGlow.style.display = "none";
    return;
  }

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let isVisible = false;
  let angle = 0;
  let animationFrameId = null;
  let hideGlowTimeout = null;
  const glowSize = 220;

  const renderGlow = () => {
    const deltaX = targetX - currentX;
    const deltaY = targetY - currentY;
    const distance = Math.min(Math.hypot(deltaX, deltaY), 210);

    currentX += deltaX * 0.12;
    currentY += deltaY * 0.12;

    if (distance > 0.8) {
      angle = Math.atan2(deltaY, deltaX);
    }

    const stretch = 1 + Math.min(distance / 180, 0.48);
    const squeeze = 1 - Math.min(distance / 1500, 0.08);

    cursorGlow.style.transform = `
      translate3d(${currentX - glowSize / 2}px, ${currentY - glowSize / 2}px, 0)
      rotate(${angle}rad)
      scale(${stretch}, ${squeeze})
    `;

    if (Math.abs(deltaX) > 0.3 || Math.abs(deltaY) > 0.3) {
      animationFrameId = requestAnimationFrame(renderGlow);
      return;
    }

    animationFrameId = null;
  };

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;

    window.clearTimeout(hideGlowTimeout);

    if (!isVisible) {
      isVisible = true;
      cursorGlow.style.opacity = "1";
    }

    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(renderGlow);
    }

    hideGlowTimeout = window.setTimeout(() => {
      isVisible = false;
      cursorGlow.style.opacity = "0";
    }, 140);
  });

  document.addEventListener("mouseleave", () => {
    window.clearTimeout(hideGlowTimeout);
    isVisible = false;
    cursorGlow.style.opacity = "0";
  });
};

setupCursorGlow();

// TODO: заменить ссылку-заглушку Telegram на реальный username или подключить отправку формы во второй версии.
