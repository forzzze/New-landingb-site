import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";

const colorBendsMock = vi.hoisted(() => vi.fn());

const setMatchMedia = ({ finePointer = true, desktop = true, reducedMotion = false } = {}) => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches:
      (query === "(pointer: fine)" && finePointer) ||
      (query === "(min-width: 901px)" && desktop) ||
      (query === "(prefers-reduced-motion: reduce)" && reducedMotion),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

vi.mock("./components/ColorBends.jsx", () => ({
  default: (props) => {
    colorBendsMock(props);
    return <div data-testid="color-bends" className={props.className} />;
  },
}));

describe("App", () => {
  beforeEach(() => {
    cleanup();
    colorBendsMock.mockClear();
    setMatchMedia();
  });

  it("renders the landing offer above the Color Bends background", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /Лендинги за 7–14 дней/i })).toBeInTheDocument();
    expect(document.querySelector(".app-background")).toBeInTheDocument();
    expect(screen.getByTestId("color-bends")).toHaveClass("app-color-bends");
  });

  it("does not mount the animated WebGL background on mobile", () => {
    setMatchMedia({ finePointer: false, desktop: false });

    render(<App />);

    expect(screen.queryByTestId("color-bends")).not.toBeInTheDocument();
    expect(document.querySelector(".app-background")).toHaveClass("is-static");
  });

  it("uses the requested Color Bends settings", () => {
    render(<App />);

    expect(colorBendsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        rotation: 90,
        speed: 0.2,
        colors: ["#ffffff", "#d9dde6", "#302746"],
        transparent: true,
        autoRotate: 0,
        scale: 1,
        frequency: 1,
        warpStrength: 1,
        mouseInfluence: 1,
        parallax: 0.5,
        noise: 0.15,
        iterations: 1,
        intensity: 1.5,
        bandWidth: 6,
      })
    );
  });

  it("stretches the Color Bends layer across the viewport", () => {
    const styles = fs.readFileSync(path.resolve("styles.css"), "utf8");
    const appBackgroundRule = styles.match(/\.app-background\s*\{[^}]+\}/)?.[0] ?? "";

    expect(appBackgroundRule).toContain("inset: 0;");
    expect(appBackgroundRule).not.toContain("width: 1080px;");
    expect(appBackgroundRule).not.toContain("height: 1080px;");
    expect(appBackgroundRule).not.toContain("transform: translateX(-50%);");
  });

  it("centers services and pricing sections when navigation links are clicked", () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    render(<App />);

    fireEvent.click(screen.getAllByRole("link", { name: "Услуги" })[0]);
    fireEvent.click(screen.getAllByRole("link", { name: "Тарифы" })[0]);

    expect(scrollIntoView).toHaveBeenNthCalledWith(1, { behavior: "smooth", block: "center" });
    expect(scrollIntoView).toHaveBeenNthCalledWith(2, { behavior: "smooth", block: "center" });
  });

  it("scrolls to the page top when the site logo is clicked", () => {
    const scrollIntoView = vi.fn();
    const scrollTo = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.scrollTo = scrollTo;

    render(<App />);

    fireEvent.click(screen.getAllByLabelText("FORZE LAND - на главную")[0]);

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("keeps the header logo larger and closer to the wordmark", () => {
    const styles = fs.readFileSync(path.resolve("styles.css"), "utf8");
    const headerBrandRule = styles.match(/\.site-header\s+\.brand\s*\{[^}]+\}/)?.[0] ?? "";
    const headerBrandMarkRule = styles.match(/\.site-header\s+\.brand-mark\s*\{[^}]+\}/)?.[0] ?? "";

    expect(headerBrandRule).toContain("gap: 4px;");
    expect(headerBrandMarkRule).toContain("width: 48px;");
    expect(headerBrandMarkRule).toContain("height: 48px;");
  });

  it("builds with relative asset paths for subpath hosting", () => {
    const viteConfig = fs.readFileSync(path.resolve("vite.config.js"), "utf8");

    expect(viteConfig).toContain('base: "./"');
  });
});
