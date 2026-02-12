
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // Polyfill Buffer for browser compatibility (required by algosdk)
  import { Buffer } from 'buffer';
  window.Buffer = Buffer;

  createRoot(document.getElementById("root")!).render(<App />);
  