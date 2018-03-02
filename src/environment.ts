const baseRoute: string = 'http://localhost:8000';

// tslint:disable-next-line no-default-export
export default {
  debug: true,
  testing: true,
  processlist: {
    pageLimit: 10,
  },
  processengine: {
    poolingInterval: 5000,
    routes: {
      processes: `${baseRoute}/datastore/ProcessDef`,
      startProcess: `${baseRoute}/processengine/start`,
      processInstances: `${baseRoute}/datastore/Process`,
      messageBus: `${baseRoute}/mb`,
      iam: `${baseRoute}/iam`,
      userTasks: `${baseRoute}/datastore/UserTask`,
    },
  },
  events: {
    xmlChanged: 'xmlChanged',
  },
  consumerClient: {
    baseRoute: baseRoute,
  },
  propertyPanel: {
    minWidth: 190,
    maxWidth: 150,
  },
  colorPickerSettings: {
    loadTimeout: 10,
    uiSettings: {
      clickoutFiresChange: true,
      showPalette: true,
      palette: [],
      localStorageKey: 'elementColors',
      showInitial: true,
      showInput: true,
      allowEmpty: true,
      showButtons: false,
      showPaletteOnly: true,
      togglePaletteOnly: true,
    },
  },
};
