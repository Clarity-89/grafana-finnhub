// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';

// @grafana/ui's Select menu observes option visibility; jsdom has no IntersectionObserver.
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
