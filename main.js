/**
 * main.js - SPA-Router fuer FakeIt
 *
 * Steuert die Navigation der Single-Page-Application ueber URL-Hashes.
 * Laedt Seiten-HTML und zugehoerige Scripts dynamisch in den #content-Container.
 *
 * Gueltige Routen: #home, #game, #newgame, #info, #categories
 * Ungueltige Hashes fuehren zur 404-Seite.
 */

/** Aktuell geladene Seite (Hash ohne #) */
let currentPage = "";

/** Flag: Wurde per Browser-Zurueck navigiert? Wird fuer Game-Cleanup genutzt. */
let isNavigatingBack = false;

/**
 * Laedt eine Seite basierend auf dem aktuellen URL-Hash.
 * Holt das HTML aus sites/<hash>.html und fuegt es in #content ein,
 * dann wird sites/<hash>.js als Script-Tag mit Cache-Busting angehaengt.
 *
 * @param {boolean} forceReload - Erzwingt Neuladen auch bei gleicher Seite
 */
async function loadPage(forceReload = false) {
  const hash = location.hash.replace("#", "") || "home";
  const sites = ["home", "game", "newgame", "info", "categories"];

  if (!sites.includes(hash)) {
    PageNotFound();
    return;
  }

  // Beim Zuruecknavigieren aus dem Spiel: Spieldaten aufraeumen,
  // damit kein veralteter Spielzustand bestehen bleibt
  if (isNavigatingBack && currentPage === "game" && hash !== "game") {
    const gameData = sessionStorage.getItem("gameData");
    if (gameData) {
      sessionStorage.removeItem("gameData");
    }
  }
  isNavigatingBack = false;

  // Gleiche Seite nicht erneut laden (ausser bei forceReload)
  if (hash === currentPage && !forceReload) {
    return;
  }

  currentPage = hash;
  const pagePath = `sites/${hash}.html`;
  const scriptPath = `sites/${hash}.js`;

  try {
    // HTML der Zielseite laden und in den Container einfuegen
    const response = await fetch(pagePath);
    const html = await response.text();
    document.getElementById("content").innerHTML = html;

    // Vorheriges dynamisches Script entfernen (verhindert Duplikate)
    const existingScript = document.getElementById("dynamic-script");
    if (existingScript) {
      existingScript.remove();
    }

    // Neues Script laden mit Cache-Busting (?t=timestamp),
    // damit der Browser bei Seitenwechsel immer frischen Code ausfuehrt
    const script = document.createElement('script');
    script.src = scriptPath + '?t=' + Date.now();
    script.id = "dynamic-script";
    document.body.appendChild(script);
  } catch (err) {
    PageNotFound();
  }
}

/**
 * Zeigt die 404-Fehlerseite an.
 * Versucht sites/pagenotfound.html zu laden, zeigt sonst einen Fallback-Text.
 */
async function PageNotFound() {
  const pagePath = `sites/pagenotfound.html`;
  try {
    const response = await fetch(pagePath);
    const html = await response.text();
    document.getElementById("content").innerHTML = html;
  } catch (err) {
    document.getElementById("content").innerHTML = "<p>Page not found</p>";
  }
}

// --- Event-Listener ---

// Hash-Aenderungen (z.B. Klick auf Link oder Browser-Navigation)
window.addEventListener("hashchange", (e) => {
  isNavigatingBack = true;
  currentPage = ""; // Reset erzwingt Neuladen bei gleichem Hash
  loadPage();
});

// Browser-Zurueck/Vorwaerts-Button erkennen
window.addEventListener("popstate", () => {
  isNavigatingBack = true;
});

// Initiales Laden der App + Service-Worker-Registrierung
window.addEventListener("load", () => {
  loadPage();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
});
