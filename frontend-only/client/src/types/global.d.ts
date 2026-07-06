declare global {
  interface Window {
    // google SDK may be loaded at runtime; use any here to avoid conflicting type declarations
    google?: any;
  }
}

export {};
