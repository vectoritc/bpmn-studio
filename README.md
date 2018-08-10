# BPMN-Studio

BPMN-Studio ist eine Web- und Desktop-Applikation zur Erstellung, Verwaltung,
Ausführung und Auswertung von BPMN-Prozessen.  Es setzt auf dem BPMN.io auf und
den BPMN-Standard 2.x um.

## Was sind die Ziele dieses Projekts?

BPMN-Studio soll es dem Anwender so leicht wie möglich machen BPMN-Diagramme zu
erstellen und zu pflegen.  Des Weiteren kann BPMN-Studio mit einer Workflow
Engine verbunden werden, um diese Diagramme auszuführen.

## Relevante URLs

[ProcessEngine](https://github.com/process-engine/process_engine)
[Dokumentation](https://github.com/process-engine/documentation)
[Minimales Skeleton](https://github.com/process-engine/skeleton)

## Wie kann ich das Projekt aufsetzen?

### Voraussetzungen

* Node `>= 6.1.0`
* Laufende ProcessEngine

### Setup/Installation

**TL;DR**

1. `npm install`
1. `npm run build`
1. `npm run electron-build-<OS>`
1. `npm start` / `npm run start_dev`

**Notizen:**

1. Für `npm run electron-build-<OS>` gilt:
  Für den Platzhalter `<OS>` können folgende Werte eingesetzt werden:
  - `linux` für Linux
  - `macos` für MacOS
  - `windows` für Windows

  Beispiel:
  `npm run electron-build-macos`

**TL;DR Tests**

1. `npm start`
1. `npm run integration-test-init`
1. `npm run integration-test`

## Wie kann ich das Projekt benutzen?

### Installation der Abhängigkeiten

Die Abhängigkeiten werden wie folgt installiert:

```shell
npm install
```

### Benutzung

**Zum bauen:**

```shell
npm run build
```

Dieses Skript baut die Anwendung, das Ergebnis ist produktionsreif.

**Zum starten:**

```shell
npm start
```

Dieses Skript startet die statische Auslieferung der Anwendung auf Port 17290.
Zuerst muss die Anwendung gebaut worden sein.

Es ist möglich einen anderen Port zu spezifizieren:

```shell
npm start -- --port 9000
```

Das startet das BPMN-Studio auf Port 9000.

**Anmerkung**

Der Port muss aus technischen Gründen zwischen 1000 und 65535 liegen.

**Erreichbarkeit**

Es ist möglich eine andere IP-Adresse als 127.0.0.1 zu spezifizieren:

```shell
npm start -- --host 0.0.0.0
```

Damit ist das BPMN Studio auch von aussen erreichbar.

**Zum starten (Entwicklung)**

```shell
npm run start_dev
```

Dieses Skript startet die Auslieferung der Anwendung für die Entwicklung.
Bei Änderungen im Quelltext wird die Anwendung neugebaut und der Webbrowser
automatisch neu geladen.

### Electron Applikation

**Zum bauen:**

**Mac:**

```shell
npm run electron-build-macos
```

Nach dem Bauen kann man in dem `dist/mac` Ordner die fertige Applikation finden
und ausführen.

**Windows:**

Vor dem erstmaligen Builden müssen windows-build-tools installiert werden:

```shell
npm install --global --production windows-build-tools
```

Danach kann gebuildet werden:

```shell
npm run electron-build-windows
```

Nach dem Bauen, kann man in dem `dist/` Ordner die Datei `bpmn-studio Setup
<VERSION>.exe` ausführen, um die Applikation zu installieren; `<VERSION>` wird
durch die entsprechende Version ersetzt.

Beispiel:

`dist/bpmn-studio Setup 1.2.1.exe`

**Alternative:**

Die Releases des BPMN-Studios lassen sich alternativ auch
[hier](https://github.com/process-engine/bpmn-studio/releases)
herunterladen.

### End-to-End-Tests

Start des Webservers:

```shell
npm start
```

Ein anderes Terminal öffnen und den Selenium Server starten:

```shell
npm run integration-test-init
```

Die Tests starten:

```shell
npm run integration-test
```

## Was muss ich sonst noch wissen?

Die Konfiguration liegt unter `aurelia_project/environments/dev|stage|prod.ts`.

# Wen kann ich auf das Projekt ansprechen?

[Christoph Gnip](mailto:christoph.gnip@5minds.de)
[Alexander Kasten](mailto:alexander.kasten@5minds.de)
[Paul Heidenreich](mailto:paul.heidenreich@5minds.de)
