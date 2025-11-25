import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Ada pembaruan aplikasi tersedia. Muat ulang sekarang?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('Aplikasi siap digunakan offline');
  },
});

createRoot(document.getElementById("root")!).render(<App />);
