import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";

const colorBendsMock = vi.hoisted(() => vi.fn());

vi.mock("./components/ColorBends.jsx", () => ({
  default: (props) => {
    colorBendsMock(props);
    return <div data-testid="color-bends" className={props.className} />;
  },
}));

describe("App", () => {
  beforeAll(() => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("renders the landing offer above the Color Bends background", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /Лендинги за 7–14 дней/i })).toBeInTheDocument();
    expect(document.querySelector(".app-background")).toBeInTheDocument();
    expect(screen.getByTestId("color-bends")).toHaveClass("app-color-bends");
  });

  it("uses the requested Color Bends settings", () => {
    render(<App />);

    expect(colorBendsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        rotation: 90,
        speed: 0.2,
        colors: ["#5227FF", "#FF9FFC", "#ffffff"],
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
});
