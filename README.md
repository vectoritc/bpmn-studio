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
1. `npm run electron-build`
1. `npm run build`
1. `npm start` / `npm run start_dev`

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

### Electron Applikation

**Zum bauen:**

```shell
npm run electron-build
```

Nach dem Bauen kann man in dem `dist/mac` Ordner die fertige App finden und
ausführen.

**Alternative:**

Die Releases des BPMN-Studios lassen sich alternativ auch
[hier](https://github.com/process-engine/bpmn-studio/releases)
herunterladen.

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

Dieses Skript startet die statische Auslieferung der Anwendung auf Port 9000.
Zuerst muss die Anwendung gebaut sein.

**Zum starten (Entwicklung)**

```shell
npm run start_dev
```

Dieses Skript startet die Auslieferung der Anwendung für die Entwicklung.
Bei Änderungen im Quelltext wird die Anwendung neugebaut und der Webbrowser
automatisch neu geladen.

### End-to-End-Tests

Start des Websservers:

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

[Alexander Kasten](mailto:alexander.kasten@5minds.de)
[Paul Heidenreich](mailto:paul.heidenreich@5minds.de)
