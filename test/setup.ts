require('mutationobserver-shim');

// mock canvas to avoid console warnings
HTMLCanvasElement.prototype.getContext = jest.fn();
