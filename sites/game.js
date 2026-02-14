/**
 * game.js - Spielablauf fuer FakeIt
 *
 * Steuert den gesamten Spielablauf nach dem Start:
 *
 * Phase 1 - Rollenverteilung:
 *   Jeder Spieler sieht seinen Namen. Durch Hochziehen des Bildes (Drag)
 *   wird die Rolle aufgedeckt: Crewmate sieht das geheime Wort,
 *   Impostor sieht "Impostor" (optional mit Hinweis).
 *
 * Phase 2 - Timer:
 *   Countdown laeuft, der zufaellig gewaehlte Startspieler wird angezeigt.
 *   Die Spieler diskutieren ueber das geheime Wort.
 *
 * Phase 3 - Ergebnisse:
 *   Alle Impostors werden mit Animation aufgedeckt.
 *
 * Phase 4 - Replay:
 *   Spieleinstellungen werden in sessionStorage gespeichert und
 *   zurueck zur Spielvorbereitung navigiert.
 *
 * In IIFE gewrappt, um Variablenkonflikte bei SPA-Seitenwechsel zu vermeiden.
 */
(function() {

// --- DOM-Elemente ---

var draggableArea = document.getElementById('draggableArea');
var dragIndicator = document.getElementById('dragIndicator');
var roleText = document.querySelector('.role-text');
var cardContent = document.querySelector('.card-content');

// --- Drag-Variablen ---

var startY = 0;       // Y-Position beim Drag-Start
var currentY = 0;     // Aktuelle Drag-Verschiebung
var dragging = false;  // Wird gerade gezogen?
var maxDrag = cardContent ? cardContent.offsetHeight * 0.75 : 300;

// --- Spielzustand ---

var nextButtonEnabled = false;
var buttonState = 'roles';  // Phasen: 'roles' -> 'timer' -> 'results' -> 'finished'
var timerInterval = null;
var currentIndex = 0;       // Aktueller Spieler-Index in der Rollenverteilung

// --- Drag-to-Reveal Mechanik ---
// Das Logo-Bild liegt ueber der Rolle. Zieht der Spieler es nach oben,
// wird die darunter liegende Rolle sichtbar. Loslassen laesst es zurueckgleiten.

if (draggableArea) {
  draggableArea.addEventListener('mousedown', startDrag);
  draggableArea.addEventListener('touchstart', startDrag, { passive: false });
}

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, { passive: false });
document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

/** Drag-Beginn: Startposition merken, Transition deaktivieren */
function startDrag(e) {
  e.preventDefault();
  dragging = true;
  if (draggableArea) {
    draggableArea.style.cursor = 'grabbing';
    draggableArea.style.transition = 'none';
  }
  startY = e.clientY || e.touches[0].clientY;
}

/** Waehrend des Drags: Bild nach oben verschieben, Rolle einblenden */
function drag(e) {
  if (!dragging) return;
  // Sicherheitspruefung: Element koennte bei Seitenwechsel fehlen
  if (!draggableArea || !document.contains(draggableArea)) {
    dragging = false;
    return;
  }
  e.preventDefault();

  // Sobald der Spieler zieht, wird der Weiter-Button freigeschaltet
  enableNextButton();

  var clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
  if (!clientY) return;

  // Verschiebung berechnen (nur nach oben, geclampt auf 75% der Kartenhoehe)
  var currentMaxDrag = cardContent ? cardContent.offsetHeight * 0.75 : 300;
  var diff = startY - clientY;
  currentY = Math.min(Math.max(0, diff), currentMaxDrag);

  draggableArea.style.transform = 'translateY(-' + currentY + 'px)';

  // Drag-Indikator ausblenden, Rollentext einblenden (proportional zur Verschiebung)
  if (dragIndicator) {
    dragIndicator.style.opacity = 1 - (currentY / maxDrag);
  }
  if (roleText) {
    roleText.style.opacity = currentY / maxDrag;
  }
}

/** Drag-Ende: Bild zurueckgleiten lassen, Rolle wieder verbergen */
function endDrag() {
  if (!dragging) return;
  dragging = false;
  if (!draggableArea || !document.contains(draggableArea)) return;

  draggableArea.style.cursor = 'grab';
  draggableArea.style.transition = 'transform 0.4s ease';
  draggableArea.style.transform = 'translateY(0)';

  // Nach der Animation: Opazitaeten zuruecksetzen
  setTimeout(function() {
    if (dragIndicator && document.contains(dragIndicator)) {
      dragIndicator.style.opacity = '1';
    }
    if (roleText && document.contains(roleText)) {
      roleText.style.opacity = '0';
    }
  }, 400);
}

// --- Weiter-Button Steuerung ---

function enableNextButton() {
  nextButtonEnabled = true;
  var btn = document.getElementById('nextButton');
  if (!btn) return;
  btn.classList.remove('disabled');
  btn.src = 'assets/next.png';
  btn.classList.add('nextBtn');
}

function disableNextButton() {
  nextButtonEnabled = false;
  var btn = document.getElementById('nextButton');
  if (!btn) return;
  btn.classList.remove('nextBtn');
  btn.src = 'assets/next-disabled.png';
  btn.classList.add('disabled');
}

// --- Spieldaten laden ---

var gameData = JSON.parse(sessionStorage.getItem("gameData"));

if (gameData && gameData.players && gameData.players.length > 0) {
  showPlayer(currentIndex);
} else {
  // Keine Spieldaten vorhanden -> zurueck zur Startseite
  window.location.hash = '#home';
  return;
}

// --- Rollenverteilung ---

/** Zeigt den aktuellen Spieler an und deaktiviert den Weiter-Button */
function showPlayer(index) {
  var player = gameData.players[index];
  var hint = gameData.hintsEnabled ? (gameData.hint || "") : "";
  updateView(player.name, player.role, gameData.word, hint);
  disableNextButton();
}

// --- Weiter-Button: Phasen-Steuerung ---
// Der Weiter-Button durchlaeuft die Phasen:
// 1. 'roles': Naechster Spieler oder weiter zum Timer
// 2. 'timer' -> 'results': Timer starten, dann Ergebnisse anzeigen
// 3. 'results': Ergebnisse anzeigen
// 4. 'finished': Replay starten (zurueck zu #newgame)

var nextButton = document.getElementById('nextButton');
if (nextButton) {
  nextButton.addEventListener('click', function() {
    if (!nextButtonEnabled) return;

    currentIndex++;
    if ((currentIndex < gameData.players.length) && (buttonState === 'roles')) {
      // Naechster Spieler
      showPlayer(currentIndex);
    } else if (buttonState === 'results') {
      // Ergebnisse anzeigen
      showResults();
    } else if (buttonState === 'finished') {
      // Replay: Spieldaten fuer Wiederholung speichern
      var replayData = {
        playerNames: gameData.playerNames || gameData.players.map(function(p) { return p.name; }),
        categories: gameData.categories || [],
        impostorCount: gameData.impostorCount || 1,
        maxTime: gameData.maxTime || 420,
        hintsEnabled: gameData.hintsEnabled !== undefined ? gameData.hintsEnabled : true
      };
      sessionStorage.setItem("replayData", JSON.stringify(replayData));

      // Aufraeumen
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      sessionStorage.removeItem("gameData");

      window.location.hash = '#newgame';
    } else {
      // Alle Spieler haben ihre Rolle gesehen -> Timer starten
      buttonState = 'timer';
      startTimer();
    }
  });
}

// --- Timer-Phase ---

/** Startet den Countdown-Timer und zeigt den Startspieler an */
function startTimer() {
  disableNextButton();
  if (cardContent) cardContent.classList.add("hidden");
  var timerContainer = document.getElementById("timerContainer");
  var nameText = document.getElementById("nameText");
  if (timerContainer) timerContainer.classList.remove("hidden");
  var instructions = document.getElementById("instructions");
  if (instructions) instructions.classList.add("hidden");
  if (nameText) nameText.textContent = gameData.startPlayer + " beginnt";
  var timerElement = document.getElementById("timer");
  var timeLeft = gameData.maxTime;
  if (timerElement) timerElement.textContent = formatTime(timeLeft);
  buttonState = 'results';
  enableNextButton();

  // Countdown: Jede Sekunde herunterzaehlen
  timerInterval = setInterval(function() {
    timeLeft--;
    if (timerElement && document.contains(timerElement)) {
      timerElement.textContent = formatTime(timeLeft);
    }
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      if (timerContainer && document.contains(timerContainer)) {
        timerContainer.classList.add("time-up");
        timerContainer.textContent = "Zeit abgelaufen!";
      }
    }
  }, 1000);
}

// --- Ergebnis-Phase ---

/** Zeigt alle Impostors mit animierter Liste an */
function showResults() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  var timerContainer = document.getElementById("timerContainer");
  var nameText = document.getElementById("nameText");

  if (timerContainer) {
    timerContainer.classList.remove("time-up");
    timerContainer.classList.add("hidden");
    timerContainer.classList.add("results");
    timerContainer.textContent = "";
  }
  if (nameText) nameText.textContent = "Impostors:";

  // Impostor-Liste generieren
  var resultsList = document.createElement("ul");
  resultsList.classList.add("results-list");

  gameData.players.forEach(function(player) {
    if (player.role === "Impostor") {
      var listItem = document.createElement("li");
      listItem.classList.add("impostor-item");

      var icon = document.createElement("img");
      icon.src = "assets/impostor.png";
      icon.alt = "Impostor Icon";
      icon.classList.add("impostor-icon");

      listItem.appendChild(icon);
      listItem.appendChild(document.createTextNode(player.name));
      resultsList.appendChild(listItem);
    }
  });

  if (cardContent) cardContent.classList.add("hidden");
  var resultsListEl = document.getElementById("resultsList");
  if (resultsListEl) resultsListEl.appendChild(resultsList);
  if (nextButton) nextButton.src = 'assets/check.png';
  buttonState = 'finished';
}

// --- Hilfsfunktionen ---

/** Formatiert Sekunden als MM:SS String */
function formatTime(seconds) {
  var minutes = Math.floor(seconds / 60);
  var secs = seconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

/**
 * Aktualisiert die Rollenanzeige fuer einen Spieler.
 * Setzt Name, Rollentext, Icon und Farbschema (gruen=Crewmate, rot=Impostor).
 * Crewmates sehen das geheime Wort, Impostors sehen optional einen Hinweis.
 */
function updateView(name, role, word, hint) {
  var nameText = document.getElementById("nameText");
  var playerRole = document.getElementById("roleText");
  var hintElement = document.getElementById("roleHint");
  var roleContainer = document.getElementById("roleContainer");
  var roleIcon = document.getElementById("roleIcon");

  if (nameText) nameText.textContent = name;

  if (role === "Impostor") {
    if (roleContainer) { roleContainer.classList.add("role-container-impostor"); roleContainer.classList.remove("role-container-member"); }
    if (playerRole) { playerRole.classList.add("role-text-impostor"); playerRole.classList.remove("role-text-member"); playerRole.textContent = "Impostor"; }
    if (hintElement) { hintElement.classList.add("role-hint-impostor"); hintElement.classList.remove("role-hint-member"); hintElement.textContent = hint || ""; }
    if (roleIcon) { roleIcon.classList.add("role-icon-impostor"); roleIcon.classList.remove("role-icon-member"); roleIcon.src = "assets/impostor.png"; }
  } else {
    if (roleContainer) { roleContainer.classList.add("role-container-member"); roleContainer.classList.remove("role-container-impostor"); }
    if (playerRole) { playerRole.classList.add("role-text-member"); playerRole.classList.remove("role-text-impostor"); playerRole.textContent = "Crewmate"; }
    if (hintElement) { hintElement.classList.add("role-hint-member"); hintElement.classList.remove("role-hint-impostor"); hintElement.textContent = word || ""; }
    if (roleIcon) { roleIcon.classList.add("role-icon-member"); roleIcon.classList.remove("role-icon-impostor"); roleIcon.src = "assets/crew.png"; }
  }
}

})();
