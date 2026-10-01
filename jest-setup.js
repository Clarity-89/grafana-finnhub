// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';

// @grafana/ui's Combobox virtualizes its option list from element sizes, which jsdom reports as 0.
const rect = { width: 400, height: 400, top: 0, left: 0, bottom: 400, right: 400, x: 0, y: 0, toJSON: () => {} };
Object.defineProperty(Element.prototype, 'getBoundingClientRect', { value: () => rect, configurable: true });
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { get: () => rect.width, configurable: true });
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { get: () => rect.height, configurable: true });

// Combobox sizes its menu by measuring option text on a canvas; jsdom has no 2D context.
HTMLCanvasElement.prototype.getContext = () => ({ font: '', measureText: (text) => ({ width: text.length * 8 }) });

// Floating menus observe their anchor's visibility; jsdom has no IntersectionObserver.
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  value: class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  },
});
