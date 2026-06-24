import { useEffect, useState } from "react";
import ColorBends from "./components/ColorBends.jsx";
import landingMarkup from "./landing.html?raw";
import brandMarkUrl from "../assets/brand-mark.svg";

const landingHtml = landingMarkup.replaceAll("assets/brand-mark.svg", brandMarkUrl);
const animatedBackgroundQueries = ["(pointer: fine)", "(min-width: 901px)", "(prefers-reduced-motion: reduce)"];

const canUseAnimatedBackground = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return (
    window.matchMedia(animatedBackgroundQueries[0]).matches &&
    window.matchMedia(animatedBackgroundQueries[1]).matches &&
    !window.matchMedia(animatedBackgroundQueries[2]).matches
  );
};

const useAnimatedBackground = () => {
  const [canAnimateBackground, setCanAnimateBackground] = useState(canUseAnimatedBackground);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQueries = animatedBackgroundQueries.map((query) => window.matchMedia(query));
    const updateBackgroundMode = () => setCanAnimateBackground(canUseAnimatedBackground());

    updateBackgroundMode();

    mediaQueries.forEach((mediaQuery) => {
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", updateBackgroundMode);
        return;
      }

      mediaQuery.addListener?.(updateBackgroundMode);
    });

    return () => {
      mediaQueries.forEach((mediaQuery) => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", updateBackgroundMode);
          return;
        }

        mediaQuery.removeListener?.(updateBackgroundMode);
      });
    };
  }, []);

  return canAnimateBackground;
};

const useLandingInteractions = () => {
  useEffect(() => {
    const cleanups = [];
    const burger = document.querySelector(".burger");
    const mobileMenu = document.querySelector(".mobile-menu");
    const navLinks = document.querySelectorAll('a[href^="#"]');
    const faqItems = document.querySelectorAll(".faq-item");
    const cursorGlow = document.querySelector(".cursor-glow");
    const heroVisual = document.querySelector(".hero-visual");
    const revealTargets = document.querySelectorAll(
      ".section:not(.hero), .glass-card, .feature-card, .process-item, .price-card, .faq-item, .cta-panel"
    );

    const closeMenu = () => {
      document.body.classList.remove("menu-open");
      burger?.classList.remove("is-active");
      mobileMenu?.classList.remove("is-open");
      burger?.setAttribute("aria-expanded", "false");
      burger?.setAttribute("aria-label", "Открыть меню");
    };

    const handleBurgerClick = () => {
      if (!burger) {
        return;
      }

      const isOpen = burger.classList.toggle("is-active");

      document.body.classList.toggle("menu-open", isOpen);
      mobileMenu?.classList.toggle("is-open", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
      burger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    };

    burger?.addEventListener("click", handleBurgerClick);
    cleanups.push(() => burger?.removeEventListener("click", handleBurgerClick));

    navLinks.forEach((link) => {
      const handleLinkClick = (event) => {
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

        if (targetId === "#top") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        const blockPosition = targetId === "#services" || targetId === "#pricing" ? "center" : "start";
        target.scrollIntoView({ behavior: "smooth", block: blockPosition });
      };

      link.addEventListener("click", handleLinkClick);
      cleanups.push(() => link.removeEventListener("click", handleLinkClick));
    });

    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");

      const handleQuestionClick = () => {
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
          question?.setAttribute("aria-expanded", "true");
          answer.style.maxHeight = `${answer.scrollHeight}px`;
        }
      };

      question?.addEventListener("click", handleQuestionClick);
      cleanups.push(() => question?.removeEventListener("click", handleQuestionClick));
    });

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    const handleResize = () => {
      document.querySelectorAll(".faq-item.is-open .faq-answer").forEach((answer) => {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      });
    };

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleResize);
    cleanups.push(() => window.removeEventListener("keydown", handleKeydown));
    cleanups.push(() => window.removeEventListener("resize", handleResize));

    const hashTarget = window.location.hash.slice(1);
    const target = hashTarget ? document.getElementById(hashTarget) : null;
    target?.scrollIntoView({ block: "start" });

    if (cursorGlow) {
      const canUseGlow =
        window.matchMedia("(pointer: fine)").matches &&
        window.matchMedia("(min-width: 901px)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!canUseGlow) {
        cursorGlow.style.display = "none";
      } else {
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

        const handleMouseMove = (event) => {
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
        };

        const handleMouseLeave = () => {
          window.clearTimeout(hideGlowTimeout);
          isVisible = false;
          cursorGlow.style.opacity = "0";
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);
        cleanups.push(() => window.removeEventListener("mousemove", handleMouseMove));
        cleanups.push(() => document.removeEventListener("mouseleave", handleMouseLeave));
        cleanups.push(() => window.clearTimeout(hideGlowTimeout));
        cleanups.push(() => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
        });
      }
    }

    if (heroVisual) {
      const canUseParallax =
        window.matchMedia("(pointer: fine)").matches &&
        window.matchMedia("(min-width: 901px)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (canUseParallax) {
        const resetVisual = () => {
          heroVisual.style.setProperty("--tilt-x", "0deg");
          heroVisual.style.setProperty("--tilt-y", "0deg");
          heroVisual.style.setProperty("--visual-x", "0px");
          heroVisual.style.setProperty("--visual-y", "0px");
        };

        const handleHeroMove = (event) => {
          const rect = heroVisual.getBoundingClientRect();
          const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
          const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

          heroVisual.style.setProperty("--tilt-x", `${(-offsetY * 7).toFixed(2)}deg`);
          heroVisual.style.setProperty("--tilt-y", `${(offsetX * 8).toFixed(2)}deg`);
          heroVisual.style.setProperty("--visual-x", `${(offsetX * 10).toFixed(2)}px`);
          heroVisual.style.setProperty("--visual-y", `${(offsetY * 8).toFixed(2)}px`);
        };

        heroVisual.addEventListener("mousemove", handleHeroMove);
        heroVisual.addEventListener("mouseleave", resetVisual);
        cleanups.push(() => heroVisual.removeEventListener("mousemove", handleHeroMove));
        cleanups.push(() => heroVisual.removeEventListener("mouseleave", resetVisual));
      }
    }

    if (revealTargets.length) {
      revealTargets.forEach((element, index) => {
        element.classList.add("reveal-item");
        element.classList.add("is-visible");
        element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 45}ms`);
      });
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      document.body.classList.remove("menu-open");
    };
  }, []);
};

export default function App() {
  const canAnimateBackground = useAnimatedBackground();

  useLandingInteractions();

  return (
    <>
      <div className={`app-background ${canAnimateBackground ? "is-animated" : "is-static"}`} aria-hidden="true">
        {canAnimateBackground ? (
          <ColorBends
            className="app-color-bends"
            rotation={90}
            speed={0.2}
            colors={["#5227FF", "#FF9FFC", "#ffffff"]}
            transparent
            autoRotate={0}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            parallax={0.5}
            noise={0.15}
            iterations={1}
            intensity={1.5}
            bandWidth={6}
          />
        ) : null}
      </div>
      <div className="background-overlay" aria-hidden="true" />
      <div className="cursor-glow" aria-hidden="true" />
      <div className="app-shell" dangerouslySetInnerHTML={{ __html: landingHtml }} />
    </>
  );
}
