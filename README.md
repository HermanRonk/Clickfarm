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

# Opmerkingen
De code die hier staat is als je een MySQL database beschikbaar hebt zelf te draaien (Docker, houd er rekening mee dat je de port in de dockerfile goed moet zetten (handmatig)). de database structuur is te vinden in de `database.sql` file. Verder is het een kwestie van de code clonen en de environment variablen mee sturen aanpassen met de juiste database gegevens.

# NodeJS version
Transitie naar NodeJS voor de backend afgerond. 

# Todo
- Olie start voorraad capaciteit is te groot
- Pasta fabriek komt niet beschikbaar


# Environment
```
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
ALLOWED_ORIGINS=
PORT=
```