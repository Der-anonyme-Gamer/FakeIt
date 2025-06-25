const draggableArea = document.getElementById('draggableArea');
const dragIndicator = document.getElementById('dragIndicator');
const roleText = document.querySelector('.role-text');

let startY = 0;
let currentY = 0;
let dragging = false;
const cardContent = document.querySelector('.card-content');
const maxDrag = cardContent.offsetHeight * 0.75;


// Event-Listener für Maus- und Touch-Events
draggableArea.addEventListener('mousedown', startDrag);
draggableArea.addEventListener('touchstart', startDrag, { passive: false });

// Event-Listener für das Bewegen
document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, { passive: false });

// Event-Listener für das Loslassen
document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

function startDrag(e) {
  e.preventDefault();
  dragging = true;
  draggableArea.style.cursor = 'grabbing';
  draggableArea.style.transition = 'none'; // Keine Transition während des Ziehens

  // Startposition ermitteln
  startY = e.clientY || e.touches[0].clientY;
}

function drag(e) {
  if (!dragging) return;
  e.preventDefault();

  enableNextButton();

  if (e.clientY === 0) return; // Verhindert Fehler bei Touch-Events ohne clientY
  const clientY = e.clientY || (e.touches[0] ? e.touches[0].clientY : 0);
  if (!clientY) return;

  // Aktuelle maxDrag berechnen (z.B. 50% der Kartenhöhe)
  const currentMaxDrag = cardContent.offsetHeight * 0.75;

  const diff = startY - clientY;
  currentY = Math.min(Math.max(0, diff), currentMaxDrag);

  // Element bewegen
  draggableArea.style.transform = `translateY(-${currentY}px)`;

  // Deckkraft des Indikators anpassen
  const opacity = 1 - (currentY / maxDrag);
  dragIndicator.style.opacity = opacity;


  // Rolle anzeigen basierend auf dem Ziehfortschritt
  roleText.style.opacity = currentY / maxDrag;
}

function endDrag() {
  if (!dragging) return;
  dragging = false;
  draggableArea.style.cursor = 'grab';
  draggableArea.style.transition = 'transform 0.4s ease'; // Sanfte Rückkehr

  // Zurück zur Ausgangsposition animieren
  draggableArea.style.transform = 'translateY(0)';

  // Indikator und Rollentext zurücksetzen
  setTimeout(() => {
    dragIndicator.style.opacity = '1';
    roleText.style.opacity = '0';
  }, 400);
}

let nextButtonEnabled = false;
let buttonState = 'roles'
function enableNextButton() {
  nextButtonEnabled = true;
  const nextButton = document.getElementById('nextButton');
  nextButton.classList.remove('disabled');
  nextButton.src = 'assets/next2.png';
  nextButton.classList.add('nextBtn');
}

function disableNextButton() {
  nextButtonEnabled = false;
  const nextButton = document.getElementById('nextButton');
  nextButton.classList.remove('nextBtn');
  nextButton.src = 'assets/next2-disabled.png';
  nextButton.classList.add('disabled');
}




const gameData = JSON.parse(sessionStorage.getItem("gameData")); // TODO Ersetze dies mit sessionStorage.getItem("data") in der echten Anwendung

let currentIndex = 0;

if (gameData && gameData.players.length > 0) {
  showPlayer(currentIndex);
} else {
  window.location.href = '/#home';
  window.location.reload(true);
}

function showPlayer(index) {
  const player = gameData.players[index];
  updateView(player.name, player.role, gameData.word, gameData.hint);
  disableNextButton(); // Deaktiviert den Button, bis der Spieler gezogen wurde
}

const nextButton = document.getElementById('nextButton');
nextButton.addEventListener('click', () => {
  if (nextButtonEnabled) {
    currentIndex++;
    if ((currentIndex < gameData.players.length) && (buttonState === 'roles')) {
      showPlayer(currentIndex);
    } else if (buttonState === 'results') {
      showResults();
    } else if (buttonState === 'finished') {
      window.location.href = '/#newgame';
      window.location.reload(true);


    } else {
      buttonState = 'timer';
      startTimer(); // Timer starten, wenn alle Spieler gezeigt wurden
    }
  }
});

function startTimer() {
  disableNextButton(); // Deaktiviert den Button, wenn der Timer startet
  cardContent.classList.add("hidden");
  const timerContainer = document.getElementById("timerContainer");
  const nameText = document.getElementById("nameText");
  timerContainer.classList.remove("hidden");
  document.getElementById("instructions").classList.add("hidden");
  nameText.textContent = gameData.startPlayer + " starts";
  const timerElement = document.getElementById("timer");
  let timeLeft = gameData.maxTime;
  timerElement.textContent = formatTime(timeLeft);
  buttonState = 'results';
  enableNextButton(); // Deaktiviert den Button, wenn die Zeit abgelaufen ist
  const timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerContainer.classList.add("time-up");
      timerContainer.textContent = "Time's up!";
    }
  }, 1000);
}

function showResults() {
  const timerContainer = document.getElementById("timerContainer");
  const nameText = document.getElementById("nameText");

  timerContainer.classList.remove("time-up");
  timerContainer.classList.add("hidden");
  timerContainer.classList.add("results");
  nameText.textContent = "Impostors:";
  timerContainer.textContent = "";

  const resultsList = document.createElement("ul");
  resultsList.classList.add("results-list");

  gameData.players.forEach(player => {
    if (player.role === "Impostor") {
      const listItem = document.createElement("li");
      listItem.classList.add("impostor-item");

      const icon = document.createElement("img");
      icon.src = "assets/impostor.png"; // Pfad zum Icon
      icon.alt = "Impostor Icon";
      icon.classList.add("impostor-icon");

      listItem.appendChild(icon);
      listItem.appendChild(document.createTextNode(player.name));
      resultsList.appendChild(listItem);
    }
  });
  cardContent.classList.add("hidden");
  document.getElementById("resultsList").appendChild(resultsList);
  nextButton.src = 'assets/check.png';
  buttonState = 'finished';

}


function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}


function updateView(name, role, word, hint) {
  const nameText = document.getElementById("nameText");
  const playerRole = document.getElementById("roleText");
  const hintElement = document.getElementById("roleHint");

  const roleContainer = document.getElementById("roleContainer");
  const roleIcon = document.getElementById("roleIcon");

  nameText.textContent = name;

  if (role === "Impostor") {
    roleContainer.classList.add("role-container-impostor");
    roleContainer.classList.remove("role-container-crewmate");
    playerRole.classList.add("role-text-impostor");
    playerRole.classList.remove("role-text-member");
    hintElement.classList.add("role-hint-impostor");
    hintElement.classList.remove("role-hint-member");
    roleIcon.classList.add("role-icon-impostor");
    roleIcon.classList.remove("role-icon-member");

    roleIcon.src = "assets/impostor.png";
    playerRole.textContent = "Impostor";
    hintElement.textContent = "";
    if (hint) {
      hintElement.textContent = hint;
    }else {
      hintElement.textContent = "";
    }
  } else {
    roleContainer.classList.add("role-container-member");
    roleContainer.classList.remove("role-container-impostor");
    playerRole.classList.add("role-text-member");
    playerRole.classList.remove("role-text-impostor");
    hintElement.classList.add("role-hint-member");
    hintElement.classList.remove("role-hint-impostor");
    roleIcon.classList.add("role-icon-member");
    roleIcon.classList.remove("role-icon-impostor");

    roleIcon.src = "assets/crew.png";
    playerRole.textContent = "Crewmate";
    hintElement.textContent = "";
    if (word) {
      hintElement.textContent = word;
    }
  }
}

