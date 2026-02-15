/**
 * newgame.js - Spielvorbereitung fuer FakeIt
 *
 * Verwaltet das Setup einer neuen Spielrunde:
 * - Spieler hinzufuegen/entfernen (mindestens 3 noetig)
 * - Impostor-Anzahl einstellen (1 bis Spieleranzahl-1)
 * - Spielzeit konfigurieren (30s bis 30min, in 30s-Schritten)
 * - Kategorien auswaehlen (Standard + benutzerdefinierte)
 * - Hinweis-System ein-/ausschalten
 * - Replay: Vorherige Spieleinstellungen automatisch wiederherstellen
 *
 * Beim Start wird ein zufaelliges Wort gewaehlt, Rollen verteilt und
 * alles als gameData in sessionStorage gespeichert.
 *
 * In IIFE gewrappt, um Variablenkonflikte bei SPA-Seitenwechsel zu vermeiden.
 */
window.initNewGame = function() {

// --- DOM-Elemente ---

var btnAddPlayer = document.getElementById("addPlayer");
var btnAddImpostor = document.getElementById("addImpostor");
var btnRemoveImpostor = document.getElementById("removeImpostor");
var playerList = document.getElementById("playerList");
var startButton = document.getElementById("startGame");
var btnMoreTime = document.getElementById("moreTime");
var btnLessTime = document.getElementById("lessTime");
var playerNameInput = document.getElementById("playerName");
var categoryPopup = document.getElementById("categoryPopup");
var categoryList = document.getElementById("categoryList");
var errorPopup = document.getElementById("errorPopup");
var errorMessage = document.getElementById("errorMessage");
var selectCategoriesBtn = document.getElementById("selectCategoriesBtn");
var selectedCategoriesText = document.getElementById("selectedCategoriesText");

// --- Spielvariablen ---

var currentTime = 420;       // Standard-Spielzeit: 7 Minuten (in Sekunden)
var MIN_TIME = 30;           // Minimum: 30 Sekunden
var MAX_TIME = 1800;         // Maximum: 30 Minuten
var selectedCategories = []; // Vom Nutzer ausgewaehlte Kategorien
var allCategories = [];      // Alle verfuegbaren Kategorien (Standard + Custom)

// --- Event-Listener ---

if (btnAddPlayer) btnAddPlayer.addEventListener("click", addPlayer);
if (btnAddImpostor) btnAddImpostor.addEventListener("click", addImpostor);
if (btnRemoveImpostor) btnRemoveImpostor.addEventListener("click", removeImpostor);
if (startButton) startButton.addEventListener("click", startGame);
if (btnMoreTime) btnMoreTime.addEventListener("click", function() { changeTime(30); });
if (btnLessTime) btnLessTime.addEventListener("click", function() { changeTime(-30); });
if (selectCategoriesBtn) selectCategoriesBtn.addEventListener("click", showCategoryPopup);

// Enter-Taste im Namensfeld fuegt Spieler hinzu
if (playerNameInput) {
    playerNameInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            addPlayer();
        }
    });
}

// --- Initialisierung ---

updateImpostorButtons();
updateTimeDisplay();
loadCategories();

// MutationObserver: Aktualisiert Impostor-Buttons wenn Spieler hinzugefuegt/entfernt werden
if (playerList) {
    var observer = new MutationObserver(function() {
        updateImpostorButtons();
    });
    observer.observe(playerList, { childList: true });
}

// --- Hilfsfunktionen: Spieler- und Impostor-Zaehler ---

/** Gibt die aktuelle Anzahl der Spieler in der Liste zurueck */
function getPlayerCount() {
    return document.getElementById("playerList") ? document.getElementById("playerList").children.length : 0;
}

/** Liest die aktuelle Impostor-Anzahl aus dem DOM */
function getImpostorCount() {
    var impostorEl = document.getElementById("impostorCount");
    return parseInt(impostorEl ? impostorEl.textContent : "1", 10);
}

/** Setzt die Impostor-Anzahl im DOM */
function setImpostorCount(count) {
    var impostorEl = document.getElementById("impostorCount");
    if (impostorEl) impostorEl.textContent = count;
}

/**
 * Aktualisiert den Zustand der +/- Buttons fuer Impostors.
 * Deaktiviert "+" wenn Maximum erreicht, "-" wenn bei 1.
 */
function updateImpostorButtons() {
    var playerCount = getPlayerCount();
    var impostorCount = getImpostorCount();

    var addBtn = document.getElementById("addImpostor");
    var removeBtn = document.getElementById("removeImpostor");

    if (addBtn) {
        addBtn.src = impostorCount >= playerCount - 1 ? "assets/add-disabled.png" : "assets/add.png";
        addBtn.classList.toggle("counter-btn-disabled", impostorCount >= playerCount - 1);
    }
    if (removeBtn) {
        removeBtn.src = impostorCount <= 1 ? "assets/minus-disabled.png" : "assets/minus.png";
        removeBtn.classList.toggle("counter-btn-disabled", impostorCount <= 1);
    }

    updateStartButton();
}

// --- Spielerverwaltung ---

/**
 * Fuegt einen Spieler direkt per Name zur Liste hinzu.
 * Wird auch von applyReplayData() genutzt.
 */
function addPlayerByName(name) {
    var li = document.createElement('li');
    li.classList.add('player-item');

    var nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    nameSpan.classList.add('player-name');

    var deleteImg = document.createElement('img');
    deleteImg.src = 'assets/delete.png';
    deleteImg.width = 20;
    deleteImg.height = 20;
    deleteImg.alt = 'Entfernen';
    deleteImg.classList.add('delete-icon');
    deleteImg.addEventListener('click', function() {
        li.remove();
        // Impostor-Anzahl anpassen falls sie jetzt zu hoch waere
        if (getImpostorCount() > getPlayerCount() - 1) {
            setImpostorCount(Math.max(1, getPlayerCount() - 1));
        }
        if (getImpostorCount() < 1) {
            setImpostorCount(1);
        }
        updateImpostorButtons();
    });

    li.appendChild(nameSpan);
    li.appendChild(deleteImg);
    playerList.appendChild(li);
}

/** Fuegt einen Spieler aus dem Eingabefeld hinzu (mit Validierung) */
function addPlayer() {
    var name = playerNameInput ? playerNameInput.value.trim() : "";

    if (!name) {
        showError("Bitte einen Namen eingeben.");
        return;
    }

    // Duplikat-Pruefung
    var existingNames = Array.from(playerList.querySelectorAll('.player-name')).map(function(el) { return el.textContent; });
    if (existingNames.includes(name)) {
        showError("Dieser Spieler existiert bereits.");
        playerNameInput.value = '';
        return;
    }

    addPlayerByName(name);
    playerNameInput.value = '';
    playerNameInput.focus();
    updateImpostorButtons();
}

/** Erhoeht die Impostor-Anzahl um 1 (max: Spieleranzahl - 1) */
function addImpostor() {
    var playerCount = getPlayerCount();
    var impostorCount = getImpostorCount();

    if (impostorCount < playerCount - 1) {
        impostorCount++;
        setImpostorCount(impostorCount);
        updateImpostorButtons();
    }
}

/** Verringert die Impostor-Anzahl um 1 (min: 1) */
function removeImpostor() {
    var impostorCount = getImpostorCount();

    if (impostorCount > 1) {
        impostorCount--;
        setImpostorCount(impostorCount);
        updateImpostorButtons();
    }
}

// --- Start-Button ---

/**
 * Aktiviert/deaktiviert den Start-Button basierend auf:
 * - Mindestens 3 Spieler
 * - Gueltige Impostor-Anzahl
 * - Mindestens eine Kategorie ausgewaehlt
 */
function updateStartButton() {
    var playerCount = getPlayerCount();
    var impostorCount = getImpostorCount();

    if (startButton) {
        if (playerCount < 3 || impostorCount > playerCount - 1 || selectedCategories.length === 0) {
            startButton.src = "assets/start-btn-disabled.png";
            startButton.classList.remove("enabled");
        } else {
            startButton.src = "assets/start-btn.png";
            startButton.classList.add("enabled");
        }
    }
}

// --- Zeitverwaltung ---

/** Aendert die Spielzeit um delta Sekunden (geclampt auf MIN/MAX) */
function changeTime(delta) {
    currentTime = Math.min(MAX_TIME, Math.max(MIN_TIME, currentTime + delta));
    updateTimeDisplay();
}

/** Aktualisiert die Zeitanzeige und den Zustand der +/- Buttons */
function updateTimeDisplay() {
    var display = document.getElementById("timeDisplay");
    var addBtn = document.getElementById("moreTime");
    var removeBtn = document.getElementById("lessTime");
    if (!display || !addBtn || !removeBtn) return;

    var min = String(Math.floor(currentTime / 60)).padStart(2, "0");
    var sec = String(currentTime % 60).padStart(2, "0");
    display.textContent = min + ":" + sec + " min";

    addBtn.src = currentTime >= MAX_TIME ? "assets/add-disabled.png" : "assets/add.png";
    removeBtn.src = currentTime <= MIN_TIME ? "assets/minus-disabled.png" : "assets/minus.png";

    addBtn.classList.toggle("counter-btn-disabled", currentTime >= MAX_TIME);
    removeBtn.classList.toggle("counter-btn-disabled", currentTime <= MIN_TIME);
}

// --- Kategorienverwaltung ---

/**
 * Laedt alle verfuegbaren Kategorien:
 * 1. Standard-Kategorien aus assets/default_categories.json
 * 2. Benutzerdefinierte Kategorien aus localStorage
 * Ruft danach applyReplayData() auf, um ggf. vorherige Einstellungen zu laden.
 */
function loadCategories() {
    fetch('assets/default_categories.json')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            var categories = data;

            // Benutzerdefinierte Kategorien aus localStorage hinzufuegen
            var customCategories = localStorage.getItem("fakeitCategories");
            if (customCategories) {
                customCategories = JSON.parse(customCategories);
                categories = categories.concat(customCategories);
            }

            allCategories = categories;
            renderCategories(categories);

            // Replay-Daten anwenden (falls "Nochmal spielen" gedrueckt wurde)
            applyReplayData();
        })
        .catch(function(error) {
            console.error("Fehler beim Laden der Kategorien:", error);
            showError("Kategorien konnten nicht geladen werden.");
        });
}

/** Rendert die Kategorie-Auswahl-Liste im Popup */
function renderCategories(categories) {
    if (!categoryList) return;
    categoryList.innerHTML = '';

    categories.forEach(function(category) {
        var categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';

        var isSelected = selectedCategories.some(function(c) { return c.id === category.id; });
        if (isSelected) {
            categoryItem.classList.add('selected');
        }

        categoryItem.innerHTML =
            '<input type="checkbox" class="category-checkbox" id="cat-' + category.id + '"' +
            (isSelected ? ' checked' : '') + '>' +
            '<div>' +
            '<div class="category-name">' + category.name + '</div>' +
            '<div class="category-words">' + category.words.length + ' Wörter</div>' +
            '</div>';

        var checkbox = categoryItem.querySelector('.category-checkbox');
        checkbox.addEventListener('change', function() {
            categoryItem.classList.toggle('selected', checkbox.checked);
        });
        // Klick auf die gesamte Zeile togglet die Checkbox
        categoryItem.addEventListener("click", function(e) {
            if (e.target === checkbox) return;
            checkbox.checked = !checkbox.checked;
            categoryItem.classList.toggle('selected', checkbox.checked);
        });

        categoryList.appendChild(categoryItem);
    });
}

// --- Popup-Funktionen ---

function showCategoryPopup() {
    if (categoryPopup) categoryPopup.classList.add('active');
}

function showError(message) {
    if (errorMessage) errorMessage.textContent = message;
    if (errorPopup) errorPopup.classList.add('active');
}

function closePopup(popupId) {
    var el = document.getElementById(popupId);
    if (el) el.classList.remove('active');
}

/** Speichert die ausgewaehlten Kategorien aus dem Popup und schliesst es */
function saveSelectedCategories() {
    var checkboxes = document.querySelectorAll('.category-checkbox');
    var cats = Array.from(checkboxes)
        .filter(function(cb) { return cb.checked; })
        .map(function(cb) {
            var id = parseInt(cb.id.replace('cat-', ''));
            var cat = allCategories.find(function(c) { return c.id === id; });
            return {
                id: id,
                words: cat ? cat.words : [],
                name: cb.parentNode.querySelector('.category-name').textContent
            };
        });

    selectedCategories = cats;
    updateSelectedCategoriesText();
    updateStartButton();
    closePopup('categoryPopup');
}

/** Aktualisiert den Anzeige-Text unter dem Kategorien-Button */
function updateSelectedCategoriesText() {
    if (!selectedCategoriesText) return;
    if (selectedCategories.length === 0) {
        selectedCategoriesText.textContent = "Keine Kategorien ausgewählt";
    } else if (selectedCategories.length === 1) {
        selectedCategoriesText.textContent = "Ausgewählt: " + selectedCategories[0].name;
    } else {
        selectedCategoriesText.textContent = "Ausgewählt: " + selectedCategories.length + " Kategorien";
    }
}

// --- Replay-System ---

/**
 * Stellt die Einstellungen einer vorherigen Runde wieder her.
 * Wird aufgerufen wenn der Spieler auf "Nochmal spielen" gedrueckt hat.
 * Die Replay-Daten werden aus sessionStorage gelesen und danach geloescht.
 */
function applyReplayData() {
    var replayDataStr = sessionStorage.getItem("replayData");
    if (!replayDataStr) return;

    try {
        var replayData = JSON.parse(replayDataStr);
        sessionStorage.removeItem("replayData");

        // Spieler wiederherstellen
        if (replayData.playerNames && replayData.playerNames.length > 0) {
            replayData.playerNames.forEach(function(name) {
                addPlayerByName(name);
            });
        }

        // Impostor-Anzahl wiederherstellen
        if (replayData.impostorCount && replayData.impostorCount > 1) {
            setImpostorCount(replayData.impostorCount);
        }

        // Spielzeit wiederherstellen
        if (replayData.maxTime) {
            currentTime = replayData.maxTime;
            updateTimeDisplay();
        }

        // Hinweis-Toggle wiederherstellen
        var hintCheckbox = document.getElementById("impostorHintCheckbox");
        if (hintCheckbox && replayData.hintsEnabled !== undefined) {
            hintCheckbox.checked = replayData.hintsEnabled;
        }

        // Kategorien wiederherstellen (nach Name, da IDs sich aendern koennten)
        if (replayData.categories && replayData.categories.length > 0) {
            var categoriesToSelect = [];
            replayData.categories.forEach(function(catName) {
                var cat = allCategories.find(function(c) { return c.name === catName; });
                if (cat) {
                    categoriesToSelect.push({
                        id: cat.id,
                        words: cat.words,
                        name: cat.name
                    });
                }
            });

            if (categoriesToSelect.length > 0) {
                selectedCategories = categoriesToSelect;
                updateSelectedCategoriesText();
                renderCategories(allCategories);
            }
        }

        updateImpostorButtons();
    } catch (e) {
        console.error("Fehler beim Laden der Replay-Daten:", e);
    }
}

// --- Spielstart ---

/**
 * Startet das Spiel:
 * 1. Validiert Eingaben (Spieler, Impostors, Kategorien)
 * 2. Weist zufaellig Impostor/Crewmate-Rollen zu
 * 3. Waehlt ein zufaelliges Wort + Hint aus den Kategorien
 * 4. Bestimmt einen zufaelligen Startspieler
 * 5. Speichert alles als gameData in sessionStorage
 * 6. Navigiert zur Game-Seite (#game)
 */
function startGame() {
    var playerCount = getPlayerCount();
    var impostorCount = getImpostorCount();
    var hintsEnabled = document.getElementById("impostorHintCheckbox").checked;

    // Validierung
    if (playerCount < 3) {
        showError("Mindestens 3 Spieler sind erforderlich.");
        return;
    }

    if (impostorCount > playerCount - 1) {
        showError("Die Anzahl der Impostors muss kleiner als die Anzahl der Spieler minus 1 sein.");
        return;
    }

    if (selectedCategories.length === 0) {
        showError("Bitte mindestens eine Kategorie auswählen.");
        showCategoryPopup();
        return;
    }

    // Rollen zufaellig zuweisen
    var playerNames = Array.from(document.querySelectorAll("#playerList li .player-name")).map(function(span) { return span.textContent; });
    var roles = Array(playerCount).fill("Crewmate");

    // Zufaellige Impostor-Auswahl per Fisher-Yates-artiger Methode
    var indices = Array.from({ length: playerCount }, function(_, i) { return i; });
    for (var i = 0; i < impostorCount; i++) {
        var randIndex = Math.floor(Math.random() * indices.length);
        var selected = indices.splice(randIndex, 1)[0];
        roles[selected] = "Impostor";
    }

    // Zufaelliges Wort aus allen ausgewaehlten Kategorien waehlen
    var allWords = [];
    selectedCategories.forEach(function(cat) {
        cat.words.forEach(function(wordObj) {
            allWords.push(wordObj);
        });
    });

    var selectedWord = allWords[Math.floor(Math.random() * allWords.length)];
    var startPlayerIndex = Math.floor(Math.random() * playerCount);

    // Zufaelligen Hint fuer den Impostor waehlen
    var hints = selectedWord.hints || [];
    var randomHint = hints.length > 0
        ? hints[Math.floor(Math.random() * hints.length)]
        : "";

    // Spieldaten zusammenstellen und speichern
    var gameData = {
        players: Array.from({ length: playerCount }, function(_, i) {
            return { name: playerNames[i], role: roles[i] };
        }),
        word: selectedWord.word,        // Das geheime Wort
        hint: randomHint,               // Ein zufaelliger Hint fuer den Impostor
        hints: hints,                   // Alle verfuegbaren Hints
        hintsEnabled: hintsEnabled,     // Ob der Impostor einen Hint bekommt
        maxTime: currentTime,           // Spielzeit in Sekunden
        startPlayer: playerNames[startPlayerIndex], // Wer beginnt die Diskussion
        categories: selectedCategories.map(function(c) { return c.name; }),
        impostorCount: impostorCount,
        playerNames: playerNames        // Fuer Replay-Funktion
    };

    sessionStorage.setItem("gameData", JSON.stringify(gameData));
    window.location.hash = "#game";
}

// --- Globale Funktionen fuer HTML onclick-Handler ---
window.closePopup = closePopup;
window.saveSelectedCategories = saveSelectedCategories;

}; // Ende von initNewGame
