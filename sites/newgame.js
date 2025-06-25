// console.log("Script loaded: newgame.js");


// const btnAddPlayer = document.getElementById("addPlayer");
// const btnAddImpostor = document.getElementById("addImpostor");
// const btnRemoveImpostor = document.getElementById("removeImpostor");
// const playerList = document.getElementById("playerList");
// const startButton = document.getElementById("startGame");
// const btnMoreTime = document.getElementById("moreTime");
// const btnLessTime = document.getElementById("lessTime");


// btnAddPlayer?.addEventListener("click", addPlayer);
// btnAddImpostor?.addEventListener("click", addImpostor);
// btnRemoveImpostor?.addEventListener("click", removeImpostor);
// startButton?.addEventListener("click", startGame);

// let currentTime = 14 * 30; // 7min in Sekunden
// const MIN_TIME = 30;  // 30 Sekunden
// const MAX_TIME = 1800; // 30 Minuten (30*60)

// document.getElementById("moreTime").addEventListener("click", () => changeTime(30));
// document.getElementById("lessTime").addEventListener("click", () => changeTime(-30));

// document.getElementById("playerName")?.addEventListener("keydown", (event) => {
//     if (event.key === "Enter") {
//         addPlayer();
//     }
// });


// updateImpostorButtons();
// updateTimeDisplay();

// // Listener für Änderungen an der Spieleranzahl

// if (playerList) {
//     const observer = new MutationObserver(() => {
//         updateImpostorButtons();
//     });

//     observer.observe(playerList, {
//         childList: true, // Nur direkte Kinder (z. B. <li>-Einträge)
//     });
// }

// function getPlayerCount() {
//     return document.getElementById("playerList")?.children.length || 0;
// }

// function getImpostorCount() {
//     const impostorEl = document.getElementById("impostorCount");
//     return parseInt(impostorEl?.textContent || "1", 10);
// }

// function setImpostorCount(count) {
//     const impostorEl = document.getElementById("impostorCount");
//     if (impostorEl) impostorEl.textContent = count;
// }

// function updateImpostorButtons() {
//     const playerCount = getPlayerCount();
//     const impostorCount = getImpostorCount();

//     const addBtn = document.getElementById("addImpostor");
//     const removeBtn = document.getElementById("removeImpostor");

//     if (addBtn) {
//         addBtn.src = impostorCount >= playerCount - 1 ? "/assets/add-disabled.png" : "/assets/add2.png";
//         addBtn.classList.toggle("counter-btn-disabled", impostorCount >= playerCount - 1);
//     }
//     if (removeBtn) {
//         removeBtn.src = impostorCount <= 1 ? "/assets/minus-disabled.png" : "/assets/minus2.png";
//         removeBtn.classList.toggle("counter-btn-disabled", impostorCount <= 1);
//     }

//     updateStartButton();
// }


// function addPlayer() {
//     const input = document.getElementById("playerName");
//     const name = input?.value.trim();

//     if (!name) {
//         alert("Bitte einen Namen eingeben.");
//         return;
//     }

//     const playerList = document.getElementById("playerList");
//     const li = document.createElement('li');
//     li.classList.add('player-item');

//     const nameSpan = document.createElement('span');
//     nameSpan.textContent = name;

//     const deleteImg = document.createElement('img');
//     deleteImg.src = '/assets/delete.png'; // dein Icon hier
//     deleteImg.width = 20;
//     deleteImg.height = 20;
//     deleteImg.alt = 'Entfernen';
//     deleteImg.classList.add('delete-icon');
//     deleteImg.addEventListener('click', () => {
//         li.remove();
//         if (getImpostorCount() > getPlayerCount() - 1) {
//             setImpostorCount(getPlayerCount() - 1);
//         }
//         if (getImpostorCount() < 2) {
//             setImpostorCount(1);
//         }
//         updateImpostorButtons();
//     });

//     li.appendChild(nameSpan);
//     li.appendChild(deleteImg);
//     playerList.appendChild(li);

//     input.value = '';
//     updateImpostorButtons();
// }

// function addImpostor() {
//     const playerCount = getPlayerCount();
//     let impostorCount = getImpostorCount();

//     if (impostorCount < playerCount - 1) {
//         impostorCount++;
//         setImpostorCount(impostorCount);
//         updateImpostorButtons();
//     }
// }

// function removeImpostor() {
//     let impostorCount = getImpostorCount();

//     if (impostorCount > 1) {
//         impostorCount--;
//         setImpostorCount(impostorCount);
//         updateImpostorButtons();
//     }
// }

// function updateStartButton() {
//     const playerCount = getPlayerCount();
//     const impostorCount = getImpostorCount();
//     const startButton = document.getElementById("startGame");

//     if (startButton) {
//         if (playerCount < 3 || impostorCount > playerCount - 1) {
//             startButton.src = "/assets/start-btn-disabled.png";
//             startButton.classList.remove("enabled");
//         } else {
//             startButton.src = "/assets/start-btn2.png";
//             startButton.classList.add("enabled");
//         }
//     }
// }

// function changeTime(delta) {
//     currentTime = Math.min(MAX_TIME, Math.max(MIN_TIME, currentTime + delta));
//     updateTimeDisplay();
// }

// function updateTimeDisplay() {
//     const display = document.getElementById("timeDisplay");
//     const addBtn = document.getElementById("moreTime");
//     const removeBtn = document.getElementById("lessTime");

//     const min = String(Math.floor(currentTime / 60)).padStart(2, "0");
//     const sec = String(currentTime % 60).padStart(2, "0");
//     display.textContent = `${min}:${sec} min`;

//     addBtn.src = currentTime >= MAX_TIME ? "/assets/add-disabled.png" : "/assets/add2.png";
//     removeBtn.src = currentTime <= MIN_TIME ? "/assets/minus-disabled.png" : "/assets/minus2.png";

//     addBtn.classList.toggle("counter-btn-disabled", currentTime >= MAX_TIME);
//     removeBtn.classList.toggle("counter-btn-disabled", currentTime <= MIN_TIME);
// }


// function startGame() {
//     const playerCount = getPlayerCount();
//     const impostorCount = getImpostorCount();

//     if (playerCount < 3) {
//         alert("Mindestens 3 Spieler sind erforderlich.");
//         return;
//     }

//     if (impostorCount > playerCount - 1) {
//         alert("Die Anzahl der Impostors muss kleiner als die Anzahl der Spieler minus 1 sein.");
//         return;
//     }

//     // Hier kannst du den Code zum Starten des Spiels einfügen
//     console.log("Spiel gestartet mit", playerCount, "Spielern und", impostorCount, "Impostoren.");
//     const playerNames = Array.from(document.querySelectorAll("#playerList li span")).map(span => span.textContent);
//     console.log("Spieler:", playerNames.join(", "));

//     // Generiere zufällige Rollen
//     const roles = Array(playerCount).fill("Crewmate");

//     const indices = Array.from({ length: playerCount }, (_, i) => i);
//     for (let i = 0; i < impostorCount; i++) {
//         const randIndex = Math.floor(Math.random() * indices.length);
//         const selected = indices.splice(randIndex, 1)[0];
//         roles[selected] = "Impostor";
//     }

//     // Startender Spieler
//     const startPlayerIndex = Math.floor(Math.random() * playerCount);
//     console.log("Startender Spieler:", playerNames[startPlayerIndex]);



//     console.log("Zugewiesene Rollen:", roles.join(", "));
//     // Hier kannst du die Rollen an die Spieler zuweisen und das Spiel starten
//     //alert(`Spiel gestartet mit ${playerCount} Spielern und ${impostorCount} Impostoren.\nSpieler: ${playerNames.join(", ")}\nRollen: ${roles.join(", ")}`);
//     // Speichere die Spieler und Rollen in sessionStorage
//     const gameData = {
//     players: Array.from({ length: playerCount }, (_, i) => ({
//         name: playerNames[i],
//         role: roles[i]
//     })),
//     word: "someWord",
//     hint: "some",
//     maxTime: currentTime,
//     startPlayer: playerNames[startPlayerIndex]
// };
//     sessionStorage.setItem("data", JSON.stringify(gameData));
//     console.log("Spielerdaten gespeichert:", gameData);

//     // Weiterleitung zur Spielseite
//     window.location.href = "#game";

//     // Weiterleitung oder Spiel-Logik hier
// }

// DOM-Elemente
const btnAddPlayer = document.getElementById("addPlayer");
const btnAddImpostor = document.getElementById("addImpostor");
const btnRemoveImpostor = document.getElementById("removeImpostor");
const playerList = document.getElementById("playerList");
const startButton = document.getElementById("startGame");
const btnMoreTime = document.getElementById("moreTime");
const btnLessTime = document.getElementById("lessTime");
const playerNameInput = document.getElementById("playerName");
const categoryPopup = document.getElementById("categoryPopup");
const categoryList = document.getElementById("categoryList");
const errorPopup = document.getElementById("errorPopup");
const errorMessage = document.getElementById("errorMessage");
const selectCategoriesBtn = document.getElementById("selectCategoriesBtn");
const selectedCategoriesText = document.getElementById("selectedCategoriesText");

// Spielvariablen
let currentTime = 420; // 7 Minuten (7*60)
const MIN_TIME = 30;  // 30 Sekunden
const MAX_TIME = 1800; // 30 Minuten (30*60)
let selectedCategories = [];

// Event Listener
btnAddPlayer?.addEventListener("click", addPlayer);
btnAddImpostor?.addEventListener("click", addImpostor);
btnRemoveImpostor?.addEventListener("click", removeImpostor);
startButton?.addEventListener("click", startGame);
btnMoreTime?.addEventListener("click", () => changeTime(30));
btnLessTime?.addEventListener("click", () => changeTime(-30));
selectCategoriesBtn?.addEventListener("click", showCategoryPopup);

playerNameInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addPlayer();
    }
});

// Initialisierung
updateImpostorButtons();
updateTimeDisplay();
loadCategories();

// Listener für Änderungen an der Spieleranzahl
if (playerList) {
    const observer = new MutationObserver(() => {
        updateImpostorButtons();
    });

    observer.observe(playerList, {
        childList: true,
    });
}

// Funktionen
function getPlayerCount() {
    return document.getElementById("playerList")?.children.length || 0;
}

function getImpostorCount() {
    const impostorEl = document.getElementById("impostorCount");
    return parseInt(impostorEl?.textContent || "1", 10);
}

function setImpostorCount(count) {
    const impostorEl = document.getElementById("impostorCount");
    if (impostorEl) impostorEl.textContent = count;
}

function updateImpostorButtons() {
    const playerCount = getPlayerCount();
    const impostorCount = getImpostorCount();

    const addBtn = document.getElementById("addImpostor");
    const removeBtn = document.getElementById("removeImpostor");

    if (addBtn) {
        addBtn.src = impostorCount >= playerCount - 1 ? "assets/add-disabled.png" : "assets/add2.png";
        addBtn.classList.toggle("counter-btn-disabled", impostorCount >= playerCount - 1);
    }
    if (removeBtn) {
        removeBtn.src = impostorCount <= 1 ? "assets/minus-disabled.png" : "assets/minus2.png";
        removeBtn.classList.toggle("counter-btn-disabled", impostorCount <= 1);
    }

    updateStartButton();
}

function addPlayer() {
    const name = playerNameInput?.value.trim();

    if (!name) {
        showError("Bitte einen Namen eingeben.");
        return;
    }

    if( Array.from(playerList.children).some(li => li.textContent.includes(name))) {
        showError("Dieser Spieler existiert bereits.");
        playerNameInput.value = '';
        return;
    }

    const li = document.createElement('li');
    li.classList.add('player-item');

    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    nameSpan.classList.add('player-name');

    const deleteImg = document.createElement('img');
    deleteImg.src = 'assets/delete.png';
    deleteImg.width = 20;
    deleteImg.height = 20;
    deleteImg.alt = 'Entfernen';
    deleteImg.classList.add('delete-icon');
    deleteImg.addEventListener('click', () => {
        li.remove();
        if (getImpostorCount() > getPlayerCount() - 1) {
            setImpostorCount(getPlayerCount() - 1);
        }
        if (getImpostorCount() < 2) {
            setImpostorCount(1);
        }
        updateImpostorButtons();
    });

    li.appendChild(nameSpan);
    li.appendChild(deleteImg);
    playerList.appendChild(li);

    playerNameInput.value = '';
    updateImpostorButtons();
}

function addImpostor() {
    const playerCount = getPlayerCount();
    let impostorCount = getImpostorCount();

    if (impostorCount < playerCount - 1) {
        impostorCount++;
        setImpostorCount(impostorCount);
        updateImpostorButtons();
    }
}

function removeImpostor() {
    let impostorCount = getImpostorCount();

    if (impostorCount > 1) {
        impostorCount--;
        setImpostorCount(impostorCount);
        updateImpostorButtons();
    }
}

function updateStartButton() {
    const playerCount = getPlayerCount();
    const impostorCount = getImpostorCount();

    if (startButton) {
        if (playerCount < 3 || impostorCount > playerCount - 1 || selectedCategories.length === 0) {
            startButton.src = "assets/start-btn-disabled.png";
            startButton.classList.remove("enabled");
        } else {
            startButton.src = "assets/start-btn2.png";
            startButton.classList.add("enabled");
        }
    }
}

function changeTime(delta) {
    currentTime = Math.min(MAX_TIME, Math.max(MIN_TIME, currentTime + delta));
    updateTimeDisplay();
}

function updateTimeDisplay() {
    const display = document.getElementById("timeDisplay");
    const addBtn = document.getElementById("moreTime");
    const removeBtn = document.getElementById("lessTime");

    const min = String(Math.floor(currentTime / 60)).padStart(2, "0");
    const sec = String(currentTime % 60).padStart(2, "0");
    display.textContent = `${min}:${sec} min`;

    addBtn.src = currentTime >= MAX_TIME ? "assets/add-disabled.png" : "assets/add2.png";
    removeBtn.src = currentTime <= MIN_TIME ? "assets/minus-disabled.png" : "assets/minus2.png";

    addBtn.classList.toggle("counter-btn-disabled", currentTime >= MAX_TIME);
    removeBtn.classList.toggle("counter-btn-disabled", currentTime <= MIN_TIME);
}
let allCategories = [];

function loadCategories() {
    // Hier würden normalerweise die Kategorien aus dem localStorage geladen
    // Für dieses Beispiel verwenden wir Testdaten
    let categories = [];
    //Retrieve default categories from /assets/categories.json
    fetch('assets/default_categories.json')
        .then(response => response.json())
        .then(data => {
            categories = data;

            let customCategories = localStorage.getItem("fakeitCategories");

            if (customCategories) {
                customCategories = JSON.parse(customCategories);
                categories = [...categories, ...customCategories];
            }


            allCategories = categories;




            renderCategories(categories);
        })
        .catch(error => {
            console.error("Fehler beim Laden der Kategorien:", error);
            showError("Kategorien konnten nicht geladen werden.");
        });

}

function renderCategories(categories) {
    categoryList.innerHTML = '';

    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';

        const isSelected = selectedCategories.some(c => c.id === category.id);
        if (isSelected) {
            categoryItem.classList.add('selected');
        }

        categoryItem.innerHTML = `
                    <input type="checkbox" class="category-checkbox" id="cat-${category.id}" 
                           ${isSelected ? 'checked' : ''}>
                    <div>
                        <div class="category-name">${category.name}</div>
                        <div class="category-words">${category.words.length} Wörter</div>
                    </div>
                `;

        const checkbox = categoryItem.querySelector('.category-checkbox');
        checkbox.addEventListener('change', () => {
            categoryItem.classList.toggle('selected', checkbox.checked);
        });
        categoryItem.addEventListener("click", () => {
            checkbox.checked=!checkbox.checked;
            categoryItem.classList.toggle('selected', checkbox.checked);
        })

        categoryList.appendChild(categoryItem);
    });
}

function showCategoryPopup() {
    categoryPopup.classList.add('active');
}

function closePopup(popupId) {
    document.getElementById(popupId).classList.remove('active');
}

function showError(message) {
    errorMessage.textContent = message;
    errorPopup.classList.add('active');
}

function saveSelectedCategories() {
    const checkboxes = document.querySelectorAll('.category-checkbox');
    const categories = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => {
            const id = parseInt(cb.id.replace('cat-', ''));
            // Hier würden wir normalerweise die vollständige Kategorie aus dem Speicher laden
            let words=[];
            allCategories.forEach(cat =>{
                if(cat.id === id){
                    words = cat.words;
                }
            });
            return {
                id: id,
                words: words,
                name: cb.parentNode.querySelector('.category-name').textContent
            };
        });

    selectedCategories = categories;
    updateSelectedCategoriesText();
    updateStartButton();
    closePopup('categoryPopup');
}

function updateSelectedCategoriesText() {
    if (selectedCategories.length === 0) {
        selectedCategoriesText.textContent = "Keine Kategorien ausgewählt";
    } else if (selectedCategories.length === 1) {
        selectedCategoriesText.textContent = `Ausgewählt: ${selectedCategories[0].name}`;
    } else {
        selectedCategoriesText.textContent = `Ausgewählt: ${selectedCategories.length} Kategorien`;
    }
}

function startGame() {
    const playerCount = getPlayerCount();
    const impostorCount = getImpostorCount();
    const hintsEnabled = document.getElementById("impostorHintCheckbox").checked;

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

    // Spieler und Rollen vorbereiten
    const playerNames = Array.from(document.querySelectorAll("#playerList li .player-name")).map(span => span.textContent);
    const roles = Array(playerCount).fill("Crewmate");

    // Zufällige Impostors auswählen
    const indices = Array.from({ length: playerCount }, (_, i) => i);
    for (let i = 0; i < impostorCount; i++) {
        const randIndex = Math.floor(Math.random() * indices.length);
        const selected = indices.splice(randIndex, 1)[0];
        roles[selected] = "Impostor";
    }

    // Hier würden wir alle Wörter aus den ausgewählten Kategorien kombinieren
    // Für dieses Beispiel verwenden wir einfach ein Wort aus der ersten Kategorie
    let allWords = [];
    selectedCategories.forEach(cat => {
        // Hier würden wir die Wörter aus dem Speicher laden
        // Für das Beispiel nehmen wir Testdaten
        const words = [
            { word: "Testwort 1", hints: ["Hinweis 1"] },
            { word: "Testwort 2", hints: ["Hinweis 2"] }
        ];
        allWords.push(...words);
    });
    // Zufälliges Wort auswählen
    const randomWordIndex = Math.floor(Math.random() * allWords.length);
    const selectedWord = allWords[randomWordIndex];

    allHints = [];
    allHints.push(...selectedWord.hints)

    const randomHintIndex = Math.floor(Math.random() * allHints.length);
    const selectedHint = allHints[randomHintIndex];

    // Zufälligen Startspieler auswählen
    const startPlayerIndex = Math.floor(Math.random() * playerCount);

    // Zufällige Hinweise generieren
    const hints = selectedWord.hints || [];
    const selectedHints = hints.length > 0 ? hints : ["Kein Hinweis verfügbar"];
    const randomHint = selectedHints[Math.floor(Math.random() * selectedHints.length)]

    // Spielerdaten speichern
    const gameData = {
        players: Array.from({ length: playerCount }, (_, i) => ({
            name: playerNames[i],
            role: roles[i]
        })),
        word: selectedWord.word,
        hints: selectedWord.hints,
        maxTime: currentTime,
        startPlayer: playerNames[startPlayerIndex],
        categories: selectedCategories.map(c => c.name)
    };

    sessionStorage.setItem("gameData", JSON.stringify(gameData));

    // Zum Spiel weiterleiten
    window.location.href = "#game";
}
