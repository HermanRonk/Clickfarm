# Clickfarm
Clickfarm is een "simpel" webspelletje dat ik in mijn vrije tijd geschreven heb. Omdat ik het niet de aandacht kan geven die het wel verdient wil ik het nu open stellen voor bijdragen vanuit de community. Dus vandaar deze repository :).

# Hoe is het begonnen
Ik wilde graag weten hoe ver ik zou komen als ik zelf iets in HTML/CSS/Javascript zou schrijven, en dat pakte uiteindelijk iets uitgebreider uit dan ik verwacht had moet ik zeggen.

Wat werd opgevolgd met deze forumpost en de ruim 2.000 reaties die daar op volgde: https://gathering.tweakers.net/forum/list_messages/1834443

# Wat moet er gebeuren
Een aantal zaken zoals bepaalde vormen van research hebben nu nog een eigen loop, die moeten eigenlijk ondergebracht worden in de centrale loop om timing verschillen te voorkomen. Verder:

- bugfixing
- documentatie
- resterende mijnen implementeren
- Olie start voorraad capaciteit is te groot
- Pasta fabriek komt niet beschikbaar

# Hoe werkt het
Clickfarm draait volledig in de browser, er is geen backend of database (meer) nodig:

- De voortgang wordt opgeslagen in de `localStorage` van de browser.
- Marktprijzen (olie, graan, meel) en de voorraad op de markt (eieren, staal, splijtstofstaven) worden in de browser bepaald.
- Via *Game opties → Exporteer save-code* kopieer je je savegame naar het klembord. Met *Importeer save-code* zet je hem weer terug, ook in een andere browser.

De bestanden:

| Pad | Inhoud |
| --- | --- |
| `index.html` | De pagina (Bootstrap 5 en Font Awesome via jsDelivr) |
| `inc/base.js` | Alle spellogica |
| `css/style.css` | Eigen opmaak |
| `Dockerfile`, `nginx.conf` | Container die de statische bestanden serveert |
| `tests/`, `package.json`, `playwright.config.js` | End-to-end tests (gaan niet mee in de container) |

# Zelf draaien
Zonder installatie: open `index.html` in je browser, of start een simpele webserver in de map, bijvoorbeeld:

```
python3 -m http.server 8080
```

Met Docker:

```
docker build -t clickfarm .
docker run --rm -p 8080:8080 clickfarm
```

Ga daarna naar http://localhost:8080. De container luistert op poort `8080`, draait niet als root en heeft een health check op `/healthz`.

# Testen
De tests bespelen het spel in een echte browser (Playwright): levelen, welke onderdelen per level zichtbaar worden, spelverloop, opslaan/laden en eerder opgeloste bugs.

```
npm ci
npx playwright install chromium
npm test              # tegen een lokale server
npm run test:docker   # tegen de gebouwde productie-container
```

Bij iedere pull request en push naar `master` draaien de tests automatisch in GitHub Actions; het rapport staat als artifact bij de run. Zie [`tests/README.md`](tests/README.md) voor alle details.
