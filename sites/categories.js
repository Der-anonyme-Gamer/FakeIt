/**
 * categories.js - Kategorienverwaltung fuer FakeIt
 *
 * Verwaltet benutzerdefinierte Wortkategorien:
 * - Erstellen neuer Kategorien mit Woertern und Hinweisen
 * - Bearbeiten und Loeschen eigener Kategorien
 * - Ansehen von Standard-Kategorien (nur lesen)
 * - Export/Import als JSON-Datei
 * - Zuruecksetzen aller Benutzerdaten
 *
 * Standard-Kategorien werden aus assets/default_categories.json geladen
 * und sind nicht editierbar. Benutzerdefinierte Kategorien werden in
 * localStorage unter dem Key 'fakeitCategories' gespeichert.
 *
 * In IIFE gewrappt, um Variablenkonflikte bei SPA-Seitenwechsel zu vermeiden.
 */
window.initCategories = function() {

// --- Zustandsvariablen ---

var categories = [];         // Benutzerdefinierte Kategorien (aus localStorage)
var defaultCategories = [];  // Standard-Kategorien (aus JSON-Datei)
var pendingAction = null;    // Gespeicherte Callback-Funktion fuer Bestaetigungs-Popup
var isEditing = false;       // Wird gerade eine Kategorie bearbeitet?
var currentEditId = null;    // ID der Kategorie, die bearbeitet wird

// --- DOM-Elemente ---

var categoryNameInput = document.getElementById('categoryName');
var wordsContainer = document.getElementById('wordsContainer');
var addWordBtn = document.getElementById('addWordBtn');
var saveCategoryBtn = document.getElementById('saveCategoryBtn');
var categoriesContainer = document.getElementById('categoriesContainer');
var emptyState = document.getElementById('emptyState');
var exportBtn = document.getElementById('exportBtn');
var importBtn = document.getElementById('importBtn');
var resetBtn = document.getElementById('resetBtn');
var importFileInput = document.getElementById('importFile');
var formTitle = document.getElementById('formTitle');
var viewCategoryPopup = document.getElementById('viewCategoryPopup');
var viewCategoryContent = document.getElementById('viewCategoryContent');
var errorPopup = document.getElementById('errorPopup');
var errorMessage = document.getElementById('errorMessage');
var confirmPopup = document.getElementById('confirmPopup');
var confirmMessage = document.getElementById('confirmMessage');
var confirmActionBtn = document.getElementById('confirmActionBtn');
var successPopup = document.getElementById('successPopup');
var successMessage = document.getElementById('successMessage');

// --- Initialisierung ---

/** Laedt die Standard-Kategorien aus der JSON-Datei */
async function initializeDefaultCategories() {
    try {
        var response = await fetch('assets/default_categories.json');
        var data = await response.json();
        defaultCategories = data;
        renderCategories();
    } catch (error) {
        console.error("Fehler beim Laden der Kategorien:", error);
        showErrorPopup("Kategorien konnten nicht geladen werden.");
    }
}

initializeDefaultCategories();
loadCategories();
renderCategories();

// --- Event-Listener ---

if (addWordBtn) addWordBtn.addEventListener('click', function() { addWordInput(); });
if (saveCategoryBtn) saveCategoryBtn.addEventListener('click', saveCategory);
if (exportBtn) exportBtn.addEventListener('click', exportData);
if (importBtn) importBtn.addEventListener('click', function() { if (importFileInput) importFileInput.click(); });
if (importFileInput) importFileInput.addEventListener('change', importData);
if (resetBtn) resetBtn.addEventListener('click', function() {
    showConfirmPopup('Möchtest du wirklich ALLE deine Daten löschen? (Standard-Kategorien bleiben erhalten)', resetData);
});

// Erstes leeres Wort-Eingabefeld anzeigen
addWordInput();

// --- Popup-Funktionen ---

function showErrorPopup(message) {
    if (errorMessage) errorMessage.textContent = message;
    if (errorPopup) errorPopup.classList.add('active');
}

/** Zeigt ein Bestaetigungs-Popup an und speichert die Aktion fuer spaeter */
function showConfirmPopup(message, action) {
    if (confirmMessage) confirmMessage.textContent = message;
    if (confirmPopup) confirmPopup.classList.add('active');
    pendingAction = action;
}

function showSuccessPopup(message) {
    if (successMessage) successMessage.textContent = message;
    if (successPopup) successPopup.classList.add('active');
}

function closePopup(popupId) {
    var el = document.getElementById(popupId);
    if (el) el.classList.remove('active');
}

// Bestaetigungs-Button: Fuehrt die gespeicherte Aktion aus
if (confirmActionBtn) {
    confirmActionBtn.addEventListener('click', function() {
        if (pendingAction) {
            pendingAction();
            closePopup('confirmPopup');
            pendingAction = null;
        }
    });
}

// --- localStorage-Operationen ---

/** Laedt benutzerdefinierte Kategorien aus localStorage */
function loadCategories() {
    var savedCategories = localStorage.getItem('fakeitCategories');
    if (savedCategories) {
        try {
            categories = JSON.parse(savedCategories);
        } catch (e) {
            console.error('Error loading categories:', e);
            categories = [];
        }
    }
}

/** Speichert benutzerdefinierte Kategorien in localStorage */
function saveCategories() {
    localStorage.setItem('fakeitCategories', JSON.stringify(categories));
}

// --- Formular: Wort-Eingabe ---

/**
 * Fuegt eine Wort-Eingabegruppe zum Formular hinzu.
 * Jede Gruppe besteht aus einem Wort-Eingabefeld, beliebig vielen
 * Hinweis-Feldern und Buttons zum Hinzufuegen/Entfernen.
 *
 * @param {string} word - Vorausgefuelltes Wort (optional)
 * @param {string[]} hints - Vorausgefuellte Hinweise (optional)
 */
function addWordInput(word, hints) {
    if (word === undefined) word = '';
    if (hints === undefined) hints = [''];

    var wordGroup = document.createElement('div');
    wordGroup.className = 'word-input-group';

    var wordInput = document.createElement('input');
    wordInput.type = 'text';
    wordInput.className = 'word-input';
    wordInput.placeholder = 'Wort';
    wordInput.value = word;

    var removeBtn = document.createElement('button');
    removeBtn.className = 'remove-word-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = function() { wordGroup.remove(); };

    wordGroup.appendChild(wordInput);

    // Hinweis-Container mit vorhandenen Hints befuellen
    var hintsContainer = document.createElement('div');
    hintsContainer.className = 'hint-container';

    hints.forEach(function(hint) {
        var hintItem = document.createElement('div');
        hintItem.className = 'hint-item';

        var hintInput = document.createElement('input');
        hintInput.type = 'text';
        hintInput.className = 'hint-input';
        hintInput.placeholder = 'Hinweis';
        hintInput.value = hint;

        var removeHintBtn = document.createElement('button');
        removeHintBtn.className = 'remove-hint-btn';
        removeHintBtn.innerHTML = '&times;';
        removeHintBtn.onclick = function() { hintItem.remove(); };

        hintItem.appendChild(hintInput);
        hintItem.appendChild(removeHintBtn);
        hintsContainer.appendChild(hintItem);
    });

    // Button zum Hinzufuegen weiterer Hinweise
    var addHintBtn = document.createElement('button');
    addHintBtn.className = 'add-hint-btn';
    addHintBtn.textContent = '+ Weiterer Hinweis';
    addHintBtn.onclick = function() {
        var hintItem = document.createElement('div');
        hintItem.className = 'hint-item';

        var hintInput = document.createElement('input');
        hintInput.type = 'text';
        hintInput.className = 'hint-input';
        hintInput.placeholder = 'Hinweis';

        var removeHintBtn = document.createElement('button');
        removeHintBtn.className = 'remove-hint-btn';
        removeHintBtn.innerHTML = '&times;';
        removeHintBtn.onclick = function() { hintItem.remove(); };

        hintItem.appendChild(hintInput);
        hintItem.appendChild(removeHintBtn);
        hintsContainer.insertBefore(hintItem, addHintBtn);
    };

    hintsContainer.appendChild(addHintBtn);
    wordGroup.appendChild(hintsContainer);
    wordGroup.appendChild(removeBtn);
    if (wordsContainer) wordsContainer.appendChild(wordGroup);
}

// --- Kategorie speichern ---

/**
 * Speichert die aktuelle Kategorie aus dem Formular.
 * Validiert Name und Woerter, erstellt oder aktualisiert die Kategorie.
 */
function saveCategory() {
    var name = categoryNameInput ? categoryNameInput.value.trim() : '';

    if (!name) {
        showErrorPopup('Bitte einen Kategorienamen eingeben');
        return;
    }

    // Alle Wort-Gruppen auslesen
    var wordGroups = wordsContainer ? wordsContainer.querySelectorAll('.word-input-group') : [];
    var words = [];
    var isEmpty = true;

    wordGroups.forEach(function(group) {
        var wordInput = group.querySelector('.word-input');
        var word = wordInput.value.trim();

        if (word) {
            var hintInputs = group.querySelectorAll('.hint-item .hint-input');
            var hints = [];

            hintInputs.forEach(function(input) {
                var hint = input.value.trim();
                if (hint) hints.push(hint);
            });

            if (hints.length === 0) hints.push('Kein Hinweis');

            words.push({ word: word, hints: hints });
            isEmpty = false;
        }
    });

    if (isEmpty) {
        showErrorPopup('Bitte mindestens ein Wort hinzufügen');
        return;
    }

    if (isEditing) {
        // Bestehende Kategorie aktualisieren
        var index = categories.findIndex(function(c) { return c.id === currentEditId; });
        if (index !== -1) {
            categories[index] = { id: currentEditId, name: name, words: words };
        }
    } else {
        // Neue Kategorie erstellen (ID = Zeitstempel)
        categories.push({ id: Date.now(), name: name, words: words });
    }

    saveCategories();
    renderCategories();
    resetForm();

    showSuccessPopup('Kategorie erfolgreich ' + (isEditing ? 'aktualisiert' : 'gespeichert') + '!');
}

/** Setzt das Formular in den Ausgangszustand zurueck */
function resetForm() {
    isEditing = false;
    currentEditId = null;
    if (formTitle) formTitle.textContent = 'Neue Kategorie';
    if (categoryNameInput) categoryNameInput.value = '';
    if (wordsContainer) wordsContainer.innerHTML = '';
    addWordInput();
}

// --- Kategorie-Anzeige ---

/**
 * Rendert alle Kategorien (Standard + benutzerdefiniert) als Karten.
 * Standard-Kategorien haben einen "Ansehen"-Button,
 * benutzerdefinierte Kategorien haben "Bearbeiten" und "Loeschen".
 */
function renderCategories() {
    var allCats = defaultCategories.concat(categories);

    if (allCats.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (categoriesContainer) categoriesContainer.innerHTML = '';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (categoriesContainer) categoriesContainer.innerHTML = '';

    allCats.forEach(function(category) {
        var card = document.createElement('div');
        card.className = 'category-card' + (category.isDefault ? ' default-category' : '');

        // Vorschau: Erste 3 Woerter anzeigen, Rest als "+X weitere"
        card.innerHTML =
            '<div class="category-name">' + category.name +
            (category.isDefault ? ' <span style="font-size:0.8em;color:#aaa;">(Standard)</span>' : '') +
            '</div>' +
            '<div class="words-list">' +
            category.words.slice(0, 3).map(function(w) {
                return '<div class="word-item"><span class="word-text">' + w.word + '</span>' +
                       '<div class="hint-text">' + w.hints.length + ' Hinweis' + (w.hints.length !== 1 ? 'e' : '') + '</div></div>';
            }).join('') +
            (category.words.length > 3 ? '<div style="padding: 8px 0; color: #aaa; text-align: center;">+ ' + (category.words.length - 3) + ' weitere</div>' : '') +
            '</div>' +
            '<div class="actions">' +
            (!category.isDefault ?
                '<button class="action-btn" onclick="editCategory(' + category.id + ')">Bearbeiten</button>' +
                '<button class="action-btn btn-delete" onclick="showConfirmPopup(\'Kategorie wirklich löschen?\', function() { deleteCategory(' + category.id + '); })">Löschen</button>'
                :
                '<button class="action-btn" onclick="viewCategory(' + category.id + ')">Ansehen</button>' +
                '<button class="action-btn" style="visibility:hidden;" disabled></button>'
            ) +
            '</div>';

        if (categoriesContainer) categoriesContainer.appendChild(card);
    });
}

// --- Kategorie-Aktionen ---

/** Zeigt alle Woerter und Hinweise einer Kategorie in einem Popup */
function viewCategory(id) {
    var allCats = defaultCategories.concat(categories);
    var category = allCats.find(function(c) { return c.id === id; });
    if (!category) return;

    if (viewCategoryContent) {
        viewCategoryContent.innerHTML =
            '<div class="category-title">' + category.name + '</div>' +
            '<div class="words-container">' +
            category.words.map(function(w) {
                return '<div class="word-card"><div class="word-name">' + w.word + '</div>' +
                       '<div class="hints-list">' +
                       w.hints.map(function(h) { return '<div class="hint-item">' + h + '</div>'; }).join('') +
                       '</div></div>';
            }).join('') +
            '</div>';
    }

    if (viewCategoryPopup) viewCategoryPopup.classList.add('active');
}

/** Laedt eine benutzerdefinierte Kategorie ins Bearbeitungsformular */
function editCategory(id) {
    var category = categories.find(function(c) { return c.id === id; });
    if (!category) return;

    if (formTitle) formTitle.textContent = category.name + ' bearbeiten';
    if (categoryNameInput) categoryNameInput.value = category.name;
    if (wordsContainer) wordsContainer.innerHTML = '';

    category.words.forEach(function(w) {
        addWordInput(w.word, w.hints);
    });

    categories = categories.filter(function(c) { return c.id !== id; });
    saveCategories();

    isEditing = true;
    currentEditId = id;
}

/** Loescht eine benutzerdefinierte Kategorie */
function deleteCategory(id) {
    categories = categories.filter(function(c) { return c.id !== id; });
    saveCategories();
    renderCategories();
    showSuccessPopup('Kategorie gelöscht');
}

// --- Export/Import ---

/** Exportiert alle benutzerdefinierten Kategorien als JSON-Datei */
function exportData() {
    if (categories.length === 0) {
        showErrorPopup('Keine benutzerdefinierten Daten zum Exportieren');
        return;
    }

    var dataStr = JSON.stringify(categories, null, 2);
    var dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    var exportFileDefaultName = 'fakeit_categories_' + new Date().toISOString().slice(0, 10) + '.json';

    var linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    showSuccessPopup('Daten exportiert');
}

/** Importiert Kategorien aus einer JSON-Datei (ersetzt vorhandene) */
function importData(event) {
    var file = event.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var importedCategories = JSON.parse(e.target.result);
            if (Array.isArray(importedCategories) && importedCategories.length > 0) {
                categories = importedCategories;
                saveCategories();
                renderCategories();
                showSuccessPopup('Daten importiert!');
            } else {
                showErrorPopup('Ungültige Daten');
            }
        } catch (error) {
            showErrorPopup('Import fehlgeschlagen');
        }
        if (importFileInput) importFileInput.value = '';
    };
    reader.readAsText(file);
}

/** Loescht alle benutzerdefinierten Kategorien aus localStorage */
function resetData() {
    localStorage.removeItem('fakeitCategories');
    categories = [];
    renderCategories();
    resetForm();
    showSuccessPopup('Benutzerdaten zurückgesetzt');
}

// --- Globale Funktionen fuer HTML onclick-Handler ---
window.closePopup = closePopup;
window.editCategory = editCategory;
window.viewCategory = viewCategory;
window.deleteCategory = deleteCategory;
window.showConfirmPopup = showConfirmPopup;

}; // Ende von initCategories
