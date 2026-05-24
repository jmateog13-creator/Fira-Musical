# Informe d'Auditoria de Qualitat — Fira Musical

Aquest informe detalla els problemes trobats en el projecte **Fira Musical** després d'un anàlisi i proves detallades. S'estructuren els problemes en tres categories: crítics (🔴), importants (🟡) i de poliment (🟢).

---

## 🔴 Crítics

### 1. Opcions duplicades idèntiques al Derby de Notes
* **Pàgina afectada:** [jocs/derby/index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/jocs/derby/index.html)
* **Què passa:** A partir del nivell 3 (pentagrama complet) i superiors, el generador de distractors d'escala no comprova si les notes proposades com a respostes tenen el mateix nom en diferents octaves (per exemple, `MI4` i `MI5`, o `FA4` i `FA5`). Això fa que es generin opcions amb text idèntic (p. ex., dos botons de "Mi") on només un es considera correcte de forma interna, provocant confusió total i una fallada pedagògica directa.
* **Suggeriment breu:** A `data/notes.js`, en la funció `distractors`, filtrar les notes de forma que no comparteixin el mateix nom que la nota correcta (`n.nom !== notaCorrecta.nom`), ja que hi ha prou varietat en el bioma musical del curs.
* **Evidència:**
![Opcions duplicades en el Derby de Notes](/Users/jmateog13/.gemini/antigravity-ide/brain/85b04855-2818-4441-ba8c-e3a37d138500/derby_duplicate_options.png)

---

### 2. Ambigüitat de text sense octava a Pesca d'Ànecs i El Gran Tir
* **Pàgines afectades:** [jocs/pesca/index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/jocs/pesca/index.html) i [jocs/gran_tir/index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/jocs/gran_tir/index.html)
* **Què passa:** Quan s'activen regles com *"Notes en LÍNIA"* o *"Notes en ESPAI"*, els ànecs i les dianes només mostren el nom de la nota en text (p. ex. "Mi"). Però, de forma interna, algunes d'aquestes notes són correctes (com `MI4`, que està en una línia) i d'altres incorrectes (com `MI5`, que està en un espai). Com que no hi ha cap indicació gràfica de l'octava o de la posició al pentagrama al propi ànec/diana, és absolutament impossible per a l'alumne distingir-los, forçant-lo a triar a l'atzar.
* **Suggeriment breu:** Mostrar un pentagrama en miniatura en el propi ànec/diana, o bé afegir el número d'octava en format de superíndex (p. ex. `Mi⁴` vs `Mi⁵`) perquè el nom no sigui ambigu.
* **Evidència:**
````carousel
![Ànecs ambigus en la Pesca d'Ànecs](/Users/jmateog13/.gemini/antigravity-ide/brain/85b04855-2818-4441-ba8c-e3a37d138500/pesca_ambiguity.png)
<!-- slide -->
![Dianes ambigües en El Gran Tir](/Users/jmateog13/.gemini/antigravity-ide/brain/85b04855-2818-4441-ba8c-e3a37d138500/gran_tir_ambiguity.png)
````

---

### 3. Errors de tipus MIME d'àudio a la Consola
* **Pàgines afectades:** [jocs/vident/index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/jocs/vident/index.html), [jocs/timbalers/index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/jocs/timbalers/index.html) i [jocs/gran_tir/index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/jocs/gran_tir/index.html)
* **Què passa:** Els fitxers d'àudio amb extensió `.m4a` es carreguen a les etiquetes `<source>` amb els atributs de tipus incorrectes (`type="audio/mpeg"` o `type="audio/mp3"`). Això genera errors a la consola del navegador, ja que s'està decodificant un contenidor MP4/M4A com si fos MPEG/MP3 elemental.
* **Suggeriment breu:** Actualitzar l'atribut `type` de les fonts `.m4a` a `type="audio/x-m4a"` o `type="audio/mp4"`.

---

### 4. Advertència de bloqueig d'AudioContext a la càrrega inicial
* **Pàgines afectades:** [jocs/pesca/index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/jocs/pesca/index.html) i [jocs/gran_tir/index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/jocs/gran_tir/index.html)
* **Què passa:** L'objecte `AudioContext` s'instancia de forma global immediatament en carregar el codi JS, sense cap interacció prèvia de l'usuari. Això infringeix la directiva d'Autoplay dels navegadors moderns, llançant advertències o bloquejos en consola.
* **Suggeriment breu:** Inicialitzar o fer `.resume()` de l'àudio context només en rebre el primer clic o en prémer el botó de començar la partida.

---

## 🟡 Importants

### 1. Incompatibilitat del Zoom de pantalla a Firefox (Responsive)
* **Pàgines afectades:** Tots els fitxers de jocs.
* **Què passa:** L'escala responsive dels jocs depèn de la funció `autoEscalar()` que altera la propietat CSS `zoom` al `body`. Firefox no dóna suport a `zoom` al `body`, per la qual cosa en resolucions de tauleta (768px d'ample) o mòbil, l'escala es manté al 100% trencant la interfície gràfica, tallant elements (com el taulell de Timbalers) o afegint barres de desplaçament innecessàries.
* **Suggeriment breu:** En lloc d'escalar amb `zoom` a nivell de body, fer servir media queries convencionals, unitats fluides (`vw`/`vh`) o aplicar un escalat gràfic general mitjançant `transform: scale()` en un contenidor general.

---

### 2. Error de registre de col·lisions en disparar (El Gran Tir)
* **Pàgina afectada:** [jocs/gran_tir/index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/jocs/gran_tir/index.html)
* **Què passa:** El càlcul de si s'ha encertat una diana es fa comparant les coordenades absolutes `clientX`/`clientY` amb `getBoundingClientRect()`. Si el navegador aplica algun zoom de disseny o està escalat, es genera una desviació en les coordenades i molts trets perfectament alineats es registren com a fallats.
* **Suggeriment breu:** Utilitzar la delegació d'esdeveniments del DOM comprovant directament `e.target.closest('.target')` en el clic, la qual cosa és 100% robusta i independent del nivell de zoom o d'escala física de la pantalla.

---

### 3. Reinici de progrés incoherent i localitzat
* **Pàgines afectades:** [index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/index.html) i [panell.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/panell.html)
* **Què passa:** El botó "Reiniciar fira" esborra la clau central del progrés, però no neteja els estats de completat de les claus locals de cadascun dels jocs (com `derby_completed`, `vident_played_v2`, `pesca_anecs_completed_v2` o `gran_tir_completed`). Quan l'usuari torna a entrar en qualsevol joc, el joc veu que ja estava completat i torna a carregar i desar les estrelles al portal central de manera automàtica. D'altra banda, el reinici del panell de professors tampoc neteja les estrelles guanyades.
* **Suggeriment breu:** Modificar les funcions de reinici per a esborrar de forma explícita totes les claus implicades en el localStorage.

---

### 4. Cursor amagat en elements d'interfície al Gran Tir
* **Pàgina afectada:** [jocs/gran_tir/index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/jocs/gran_tir/index.html)
* **Què passa:** La directiva `body { cursor: none; }` amaga el punter a tota la pàgina des del primer instant. Com a conseqüència, en les pantalles d'inici, de configuració de volum o en els botons de retorn, l'usuari no sap on està apuntant, fent que l'ús dels formularis i controls sigui extremadament incòmode.
* **Suggeriment breu:** Aplicar `cursor: none` exclusivament al contenidor del polígon de tir (`#booth` o `#range`) mentre es juga, i mantenir el cursor de fletxa per defecte del sistema en les pantalles de menú o superposades.

---

## 🟢 Polits

### 1. Falta d'ortografia en el títol de Timbalers
* **Pàgina afectada:** [jocs/timbalers/index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/jocs/timbalers/index.html) (línia 333)
* **Què passa:** S'ha comès un error tipogràfic en el títol de la carpa d'inici, que diu `<h1>EXS TIMBALERS</h1>` en lloc d'utilitzar l'article correcte `ELS`.
* **Suggeriment breu:** Corregir el títol a `<h1>ELS TIMBALERS</h1>` o `<h1>ELS TIMBALERS DEL COMPÀS</h1>`.

---

### 2. Canvi sobtat del valor màxim d'estrelles al Portal
* **Pàgina afectada:** [index.html](file:///Users/jmateog13/Desktop/AulaTech/1.Gamificacion/Fira%20Musical/index.html)
* **Què passa:** La maquetació HTML té escrit de forma estàtica `"de 12"` estrelles, però quan el script JS s'executa a la línia 284, actualitza el comptador sumant El Gran Tir i canvia el valor a `15`. Això produeix un canvi de text instantani en carregar la pàgina que es percep com una petita errada visual.
* **Suggeriment breu:** Modificar el codi HTML de la línia 160 a `<span id="estrelles-max">15</span>` directament per evitar la fluctuació inicial.
