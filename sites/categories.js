// Datenmodell für Kategorien


let categories = [];
let defaultCategories = [];
let pendingAction = null;
let isEditing = false;
let currentEditId = null;

// DOM-Elemente
const categoryNameInput = document.getElementById('categoryName');
const wordsContainer = document.getElementById('wordsContainer');
const addWordBtn = document.getElementById('addWordBtn');
const saveCategoryBtn = document.getElementById('saveCategoryBtn');
const categoriesContainer = document.getElementById('categoriesContainer');
const emptyState = document.getElementById('emptyState');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const resetBtn = document.getElementById('resetBtn');
const importFileInput = document.getElementById('importFile');
const formTitle = document.getElementById('formTitle');
const viewCategoryPopup = document.getElementById('viewCategoryPopup');
const viewCategoryContent = document.getElementById('viewCategoryContent');

// Standard-Kategorien
async function initializeDefaultCategories() {

    try {
        const response = await fetch('assets/default_categories.json');
        const data = await response.json();
        defaultCategories = data;
        console.log("Standard-Kategorien geladen:", defaultCategories);
        renderCategories();
    } catch (error) {
        console.error("Fehler beim Laden der Kategorien:", error);
        showError("Kategorien konnten nicht geladen werden.");
    }
}

// Initialisierung

initializeDefaultCategories();
loadCategories();
renderCategories();

// Event-Listener
addWordBtn.addEventListener('click', addWordInput);
saveCategoryBtn.addEventListener('click', saveCategory);
exportBtn.addEventListener('click', exportData);
importBtn.addEventListener('click', () => importFileInput.click());
importFileInput.addEventListener('change', importData);
resetBtn.addEventListener('click', () => showConfirmPopup('Möchtest du wirklich ALLE deine Daten löschen? (Standard-Kategorien bleiben erhalten)', resetData));

// Erste Wort-Eingabe hinzufügen
addWordInput();

// Popup-Funktionen
function showErrorPopup(message) {
    errorMessage.textContent = message;
    errorPopup.classList.add('active');
}

function showConfirmPopup(message, action) {
    confirmMessage.textContent = message;
    confirmPopup.classList.add('active');
    pendingAction = action;
}

function showSuccessPopup(message) {
    successMessage.textContent = message;
    successPopup.classList.add('active');
}

function closePopup(popupId) {
    document.getElementById(popupId).classList.remove('active');
}

// Bestätigungsaktion ausführen
confirmActionBtn.addEventListener('click', () => {
    if (pendingAction) {
        pendingAction();
        closePopup('confirmPopup');
        pendingAction = null;
    }
});

// Kategorien aus localStorage laden
function loadCategories() {
    const savedCategories = localStorage.getItem('fakeitCategories');
    if (savedCategories) {
        try {
            categories = JSON.parse(savedCategories);
        } catch (e) {
            console.error('Error loading categories:', e);
            categories = [];
        }
    }
}

// Kategorien in localStorage speichern
function saveCategories() {
    localStorage.setItem('fakeitCategories', JSON.stringify(categories));
}

// Wort-Eingabegruppe hinzufügen
function addWordInput(word = '', hints = ['']) {
    const wordGroup = document.createElement('div');
    wordGroup.className = 'word-input-group';

    const wordInput = document.createElement('input');
    wordInput.type = 'text';
    wordInput.className = 'word-input';
    wordInput.placeholder = 'Wort';
    wordInput.value = '';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-word-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = () => wordGroup.remove();

    wordGroup.appendChild(wordInput);

    // Hinweise Container
    const hintsContainer = document.createElement('div');
    hintsContainer.className = 'hint-container';

    // Hinweise hinzufügen
    hints.forEach((hint, index) => {
        const hintItem = document.createElement('div');
        hintItem.className = 'hint-item';

        const hintInput = document.createElement('input');
        hintInput.type = 'text';
        hintInput.className = 'hint-input';
        hintInput.placeholder = 'Hinweis'; // Entfernt die Nummerierung
        hintInput.value = hint;

        const removeHintBtn = document.createElement('button');
        removeHintBtn.className = 'remove-hint-btn';
        removeHintBtn.innerHTML = '&times;';
        removeHintBtn.onclick = () => hintItem.remove();

        hintItem.appendChild(hintInput);
        hintItem.appendChild(removeHintBtn);
        hintsContainer.appendChild(hintItem);
    });

    // Button für weiteren Hinweis
    const addHintBtn = document.createElement('button');
    addHintBtn.className = 'add-hint-btn';
    addHintBtn.textContent = '+ Weiterer Hinweis';
    addHintBtn.onclick = () => {
        const hintItem = document.createElement('div');
        hintItem.className = 'hint-item';

        const hintInput = document.createElement('input');
        hintInput.type = 'text';
        hintInput.className = 'hint-input';
        hintInput.placeholder = 'Hinweis';

        const removeHintBtn = document.createElement('button');
        removeHintBtn.className = 'remove-hint-btn';
        removeHintBtn.innerHTML = '&times;';
        removeHintBtn.onclick = () => hintItem.remove();

        hintItem.appendChild(hintInput);
        hintItem.appendChild(removeHintBtn);
        hintsContainer.insertBefore(hintItem, addHintBtn);
    };

    hintsContainer.appendChild(addHintBtn);
    wordGroup.appendChild(hintsContainer);
    wordGroup.appendChild(removeBtn);
    wordsContainer.appendChild(wordGroup);
}

// Neue Kategorie speichern oder bestehende aktualisieren
function saveCategory() {
    const name = categoryNameInput.value.trim();

    if (!name) {
        showErrorPopup('Bitte einen Kategorienamen eingeben');
        return;
    }

    // Wörter und Hinweise sammeln
    const wordGroups = wordsContainer.querySelectorAll('.word-input-group');
    const words = [];
    let isEmpty = true;

    wordGroups.forEach(group => {
        const wordInput = group.querySelector('.word-input');
        const word = wordInput.value.trim();

        if (word) {
            // Hinweise sammeln
            const hintInputs = group.querySelectorAll('.hint-item .hint-input');
            const hints = [];

            hintInputs.forEach(input => {
                const hint = input.value.trim();
                if (hint) hints.push(hint);
            });

            // Mindestens einen Hinweis sicherstellen
            if (hints.length === 0) hints.push('Kein Hinweis');

            words.push({ word, hints });
            isEmpty = false;
        }
    });

    if (isEmpty) {
        showErrorPopup('Bitte mindestens ein Wort hinzufügen');
        return;
    }

    if (isEditing) {
        // Kategorie aktualisieren
        const index = categories.findIndex(c => c.id === currentEditId);
        if (index !== -1) {
            categories[index] = {
                id: currentEditId,
                name,
                words
            };
        }
    } else {
        // Neue Kategorie erstellen
        const newCategory = {
            id: Date.now(),
            name,
            words
        };

        // Zur Liste hinzufügen
        categories.push(newCategory);
    }

    saveCategories();
    renderCategories();
    resetForm();

    showSuccessPopup(`Kategorie erfolgreich ${isEditing ? 'aktualisiert' : 'gespeichert'}!`);
}

// Formular zurücksetzen
function resetForm() {
    isEditing = false;
    currentEditId = null;
    formTitle.textContent = 'Neue Kategorie';
    categoryNameInput.value = '';
    wordsContainer.innerHTML = '';
    addWordInput();
}

// Kategorien anzeigen
function renderCategories() {
    // Alle Kategorien kombinieren (Standard + Benutzer)
    const allCategories = [...defaultCategories, ...categories];

    if (allCategories.length === 0) {
        emptyState.style.display = 'block';
        categoriesContainer.innerHTML = '';
        return;
    }

    emptyState.style.display = 'none';
    categoriesContainer.innerHTML = '';

    allCategories.forEach(category => {
        const card = document.createElement('div');
        card.className = `category-card ${category.isDefault ? 'default-category' : ''}`;

        card.innerHTML = `
                    <div class="category-name">${category.name} ${category.isDefault ? '<span style="font-size:0.8em;color:#aaa;">(Standard)</span>' : ''}</div>
                    <div class="words-list">
                        ${category.words.slice(0, 3).map(word => `
                            <div class="word-item">
                                <span class="word-text">${word.word}</span>
                                <div class="hint-text">${word.hints.length} Hinweis${word.hints.length !== 1 ? 'e' : ''}</div>
                            </div>
                        `).join('')}
                        ${category.words.length > 3 ? `<div style="padding: 8px 0; color: #aaa; text-align: center;">+ ${category.words.length - 3} weitere</div>` : ''}
                    </div>
                    <div class="actions">
                        ${!category.isDefault ? `
                            <button class="action-btn" onclick="editCategory(${category.id})">✏️ Bearbeiten</button>
                            <button class="action-btn btn-delete" onclick="showConfirmPopup('Kategorie wirklich löschen?', () => deleteCategory(${category.id}))">🗑️ Löschen</button>
                        ` : `
                            <button class="action-btn" onclick="viewCategory(${category.id})">👁️ Ansehen</button>
                            <button class="action-btn" style="visibility:hidden;" disabled></button>
                        `}
                    </div>
                `;

        categoriesContainer.appendChild(card);
    });
}

// Kategorie ansehen (Popup)
function viewCategory(id) {
    const allCategories = [...defaultCategories, ...categories];
    const category = allCategories.find(c => c.id === id);
    if (!category) return;

    // Popup-Inhalt erstellen
    viewCategoryContent.innerHTML = `
                <div class="category-title">${category.name}</div>
                <div class="words-container">
                    ${category.words.map(word => `
                        <div class="word-card">
                            <div class="word-name">${word.word}</div>
                            <div class="hints-list">
                                ${word.hints.map(hint => `
                                    <div class="hint-item">${hint}</div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

    // Popup anzeigen
    viewCategoryPopup.classList.add('active');
}

// Kategorie bearbeiten
function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    // Formular mit Kategoriedaten füllen
    formTitle.textContent = `${category.name} bearbeiten`;
    categoryNameInput.value = category.name;

    // Wort-Eingaben leeren
    wordsContainer.innerHTML = '';

    // Wörter hinzufügen
    category.words.forEach(word => {
        addWordInput(word.word, word.hints);
    });

    // Kategorie aus der Liste entfernen (wird beim Speichern neu hinzugefügt)
    categories = categories.filter(c => c.id !== id);
    saveCategories();

    // Bearbeitungsmodus aktivieren
    isEditing = true;
    currentEditId = id;
}

// Kategorie löschen
function deleteCategory(id) {
    categories = categories.filter(c => c.id !== id);
    saveCategories();
    renderCategories();
    showSuccessPopup('Kategorie gelöscht');
}

// Daten exportieren
function exportData() {
    if (categories.length === 0) {
        showErrorPopup('Keine benutzerdefinierten Daten zum Exportieren');
        return;
    }

    const dataStr = JSON.stringify(categories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `fakeit_categories_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    showSuccessPopup('Daten exportiert');
}

// Daten importieren
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedCategories = JSON.parse(e.target.result);

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

        importFileInput.value = '';
    };
    reader.readAsText(file);
}

// Daten zurücksetzen (nur Benutzerdaten)
function resetData() {
    localStorage.removeItem('fakeitCategories');
    categories = [];
    renderCategories();
    resetForm();
    showSuccessPopup('Benutzerdaten zurückgesetzt');
}