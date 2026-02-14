# FakeIt

<p align="center">
  <img src="icons/main.png" alt="FakeIt Logo" width="200">
</p>

**FakeIt** ist ein Social-Deduction-Partyspiel als Progressive Web App (PWA). Inspiriert von Spielen wie *Spyfall* und *Among Us* versuchen Crewmates den Impostor zu entlarven, der das geheime Wort nicht kennt.

## Features

- **Offline spielbar** dank Service Worker und Cache-Strategie
- **Installierbar** als PWA auf Smartphone und Desktop
- **13 vorgefertigte Kategorien** mit je 15 Wörtern und Hinweisen
- **Eigene Kategorien** erstellen, bearbeiten, exportieren und importieren
- **Flexible Spieloptionen**: Spieleranzahl, Impostor-Anzahl, Spielzeit und Hinweis-System einstellbar
- **Replay-Funktion**: Direkt mit denselben Spielern eine neue Runde starten
- **Drag-to-Reveal**: Rollen werden durch Wischgeste aufgedeckt, damit andere nicht mitsehen

## Spielablauf

1. **Spieler hinzufügen** - Mindestens 3 Spieler, Impostor-Anzahl und Kategorien festlegen
2. **Rollen ansehen** - Jeder Spieler zieht das Bild nach oben, um seine Rolle zu sehen. Crewmates sehen das geheime Wort, Impostors nicht (oder nur einen vagen Hinweis)
3. **Diskutieren** - Alle diskutieren reihum ueber das Wort. Crewmates versuchen den Impostor zu entlarven, der Impostor tut so, als kennt er das Wort
4. **Abstimmen** - Nach Ablauf der Zeit wird abgestimmt, wer der Impostor ist
5. **Ergebnis** - Die Impostors werden aufgedeckt. Crewmates gewinnen, wenn sie den Impostor finden. Der Impostor gewinnt, wenn er unentdeckt bleibt

## Technologie-Stack

| Bereich | Technologie |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| CSS-Framework | Bootstrap 5.3 (CDN) |
| Routing | Hash-basierte SPA (eigener Router) |
| State | `sessionStorage` (Spielzustand), `localStorage` (eigene Kategorien) |
| Offline | Service Worker mit Cache-First-Strategie |
| Build-Tools | Keine - rein statische Dateien |

## Installation & Starten

FakeIt benoetigt keinen Build-Prozess. Da die App `fetch()` verwendet, muss sie ueber einen lokalen Webserver ausgefuehrt werden:

```bash
# Repository klonen
git clone https://github.com/dein-benutzername/FakeIt.git
cd FakeIt

# Mit einem beliebigen lokalen Webserver starten, z.B.:

# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code: "Live Server" Extension verwenden
```

Dann im Browser oeffnen: `http://localhost:8080`

**Als PWA installieren:** Im Browser (Chrome/Edge) auf "App installieren" klicken oder ueber "Zum Startbildschirm hinzufuegen" auf dem Smartphone.

## Projektstruktur

```
FakeIt/
├── index.html              # SPA-Shell (Einstiegspunkt)
├── main.js                 # Hash-basierter SPA-Router
├── style.css               # Globale Styles
├── manifest.json           # PWA-Manifest
├── service-worker.js       # Offline-Cache (Cache-First)
│
├── sites/                  # Seiten (werden dynamisch geladen)
│   ├── home.html/js        # Startseite
│   ├── newgame.html/js     # Spielvorbereitung
│   ├── game.html/js        # Spielablauf (Rollen, Timer, Ergebnisse)
│   ├── categories.html/js  # Kategorienverwaltung (CRUD)
│   ├── info.html/js        # Spielanleitung & Credits
│   └── pagenotfound.html   # 404-Seite
│
├── assets/                 # Spiel-Assets
│   ├── default_categories.json  # 13 Standard-Kategorien
│   └── *.png               # UI-Icons (Buttons, Rollen)
│
└── icons/                  # PWA-Icons & Favicon
    ├── android-chrome-192x192.png
    ├── android-chrome-512x512.png
    ├── favicon.ico
    └── main.png            # App-Logo
```

## Kategorien

Die App enthaelt 13 vorgefertigte Kategorien:

| Kategorie | Beschreibung |
|---|---|
| Einfache Woerter | Alltagsgegenstaende |
| Rund um die Welt | Sehenswuerdigkeiten & Orte |
| Unterhaltung | Filme, Spiele, Serien |
| Alltag | Alltagssituationen |
| Clash Royale | Karten aus dem Spiel |
| Tiere & Natur | Tiere und Naturphaenomene |
| Sport & Freizeit | Sportarten und Aktivitaeten |
| Wissen & Schule | Schulthemen und Wissenschaft |
| Feste & Feiern | Feiertage und Anlaesse |
| Stars und Promis | Beruehmte Persoenlichkeiten |
| Spicy (Ue18) | Party-Begriffe fuer Erwachsene |
| Trends | Aktuelle Trends und Technologie |
| Deutsche Begriffe | Typisch deutsche Konzepte |

Eigene Kategorien koennen ueber den Kategorienverwaltung erstellt, als JSON exportiert und importiert werden.

## Credits

Alle Icons stammen von [Flaticon](https://www.flaticon.com) und wurden von verschiedenen Designern erstellt. Die vollstaendige Zuordnung findet sich in der App unter *Info*.

## Lizenz

Dieses Projekt ist unter der **Apache License 2.0** lizenziert. Siehe [LICENSE](LICENSE) fuer Details.

---

FakeIt &copy; 2025-2026 Felix Hausmann
