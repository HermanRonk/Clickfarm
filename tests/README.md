# Tests

End-to-end tests met [Playwright](https://playwright.dev/) die het spel bespelen zoals een speler dat doet: knoppen indrukken, de tijd laten lopen en controleren wat er op het scherm staat. De tests draaien nooit in productie: de container bevat alleen `index.html`, `favicon.ico`, `css/` en `inc/`.

## Draaien

Eenmalig:

```
npm ci
npx playwright install chromium
```

| Commando | Wat het doet |
| --- | --- |
| `npm test` | Alle tests tegen een lokale statische server (start automatisch op poort 8081) |
| `npm run test:ui` | Interactieve modus: tests stap voor stap volgen in de browser |
| `npm run test:docker` | Bouwt de productie-container, start hem op poort 8090 en draait alle tests (inclusief de containercontroles) er tegenaan |
| `npm run test:report` | Opent het HTML-rapport van de laatste run |
| `npx playwright test tests/levelup.spec.js` | Eén bestand draaien |
| `npx playwright test -g "level 6"` | Tests filteren op naam |
| `BASE_URL=https://… npx playwright test` | Tegen een andere omgeving draaien (niet tegen productie: de tests resetten de savegame in die browser) |

In GitHub Actions (`.github/workflows/tests.yml`) draaien de tests bij iedere pull request en push naar `master`, zowel tegen de statische server als tegen de gebouwde container. Het HTML-rapport (met screenshots en traces van mislukte tests) staat als artifact bij de workflow-run.

## Wat wordt er getest

| Bestand | Inhoud |
| --- | --- |
| `start.spec.js` | Nieuw spel: level 1, startkapitaal, alleen landbouw zichtbaar, geen fouten in de console |
| `levelup.spec.js` | Iedere level-overgang 1 → 13: drempel, melding, nieuwe drempel, welke onderdelen vrijkomen (en welke nog verborgen zijn), ook na herladen. Plus het mijnbouwonderzoek dat prospecting, mijnen en uranium vrijgeeft |
| `gameplay.spec.js` | Spelen: land bewerken, graan verkopen, level 2 halen door te spelen, malen, olie, energie, pasta, kippen, pauzeren, verkooptab |
| `persistence.spec.js` | Herladen, exporteren/importeren van de save-code, resetten, instellingen |
| `regressions.spec.js` | Eén test per opgeloste bug of exploit, met de commit erbij |
| `layout.spec.js` | Opmaak en bediening: menu, meldingen, mobiel, donker thema, kaartbreedte, geen externe requests |
| `help.spec.js` | ?-knoppen met uitleg per kaart |
| `info.spec.js` | Informatiepagina: ingeklapte levels zonder spoilers, drempels gelijk aan het spel |
| `known-issues.spec.js` | Bekende, nog niet opgeloste problemen (zie hieronder) |
| `container.spec.js` | Alleen tegen de container: health check, beveiligingsheaders, CSP, en dat testbestanden niet worden meegeleverd |

`levels.data.js` bevat per level de drempel en de onderdelen die vrijkomen. Wordt de balans aangepast, dan hoeft alleen die tabel bijgewerkt te worden.

## Hoe het werkt

- **Nep-klok**: de hoofdloop tikt iedere seconde. De tests gebruiken `page.clock`, waardoor `tick(page, 600)` tien minuten speeltijd in een paar milliseconden afspeelt.
- **Vaste random-seed**: prijzen en prospecting gebruiken `Math.random`; die is in de tests voorspelbaar, zodat een test altijd hetzelfde verloopt.
- **Savegame klaarzetten**: `startGame(page, { state: { PlayerLevel: 8, Money: 1e6 } })` vult `localStorage` vóórdat het spel laadt. Zo kan ieder level getest worden zonder uren te spelen.
- **Waardes lezen**: kaarten tonen waardes als label/waarde-lijst (`renderStats` in `inc/base.js`). Lees ze met `stat(page, "#grain-col", "Voorraad")` in plaats van op hele zinnen te testen; zo breekt een test niet op een tekstwijziging.
- Helpers staan in `helpers/game.js`.

## Bekende problemen

Tests in `known-issues.spec.js` beschrijven het gewenste gedrag en zijn gemarkeerd met `test.fail()`. Ze zijn groen zolang de bug bestaat. Wordt een bug opgelost, dan wordt de test rood met *"expected to fail, but passed"*: haal dan de `test.fail()`-regel weg, dan draait de test voortaan mee als regressietest.
