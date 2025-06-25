async function loadPage() {
  const hash = location.hash.replace("#", "") || "home";
  const sites = ["home", "game", "newgame", "info", "categories"];
  if (!sites.includes(hash)) {
    console.log("Ungültiger Hash:", hash);
    PageNotFound();
    return;
  }
  const pagePath = `sites/${hash}.html`;
  const scriptPath = `sites/${hash}.js`;
  console.log("Lade Seite:", pagePath);

  try {
  const response = await fetch(pagePath);
  const html = await response.text();
  document.getElementById("content").innerHTML = html;

  // Altes Script entfernen, falls vorhanden
  const existingScript = document.getElementById("dynamic-script");
  if (existingScript) {
    existingScript.remove();
  }

  // Neues Script laden
  const script = document.createElement('script');
  script.src = scriptPath;
  script.id = "dynamic-script"; // <- wichtig!
  script.type = "module"; // optional, wenn du moderne JS-Module verwendest
  document.body.appendChild(script);
  
  console.log("Script geladen:", scriptPath);
} catch (err) {
  PageNotFound();
}

}

async function loadMainPage() {
  const hash = "home";
  location.hash = ""; // Setze den Hash auf "home"
  const pagePath = `sites/${hash}.html`;
  console.log("Lade Startseite:", pagePath);

  try {
  const response = await fetch(pagePath);
  const html = await response.text();
  document.getElementById("content").innerHTML = html;

  // Altes Script entfernen, falls vorhanden
  const existingScript = document.getElementById("dynamic-script");
  if (existingScript) {
    existingScript.remove();
  }

  // Neues Script laden
  const script = document.createElement('script');
  script.src = scriptPath;
  script.id = "dynamic-script"; // <- wichtig!
  script.type = "module"; // optional, wenn du moderne JS-Module verwendest
  document.body.appendChild(script);
  
  console.log("Script geladen:", scriptPath);
} catch (err) {
  PageNotFound();
}

}

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

window.addEventListener("hashchange", loadPage);
window.addEventListener("load", () => {
  loadPage();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
});

window.addEventListener("load", () => {
  console.log("Seite wird neu geladen.");
  //loadMainPage();
});



