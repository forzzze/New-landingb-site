const burger = document.querySelector(".burger");
const mobileMenu = document.querySelector(".mobile-menu");
const navLinks = document.querySelectorAll('a[href^="#"]');
const faqItems = document.querySelectorAll(".faq-item");

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

// TODO: заменить ссылку-заглушку Telegram на реальный username или подключить отправку формы во второй версии.
