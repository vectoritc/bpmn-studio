const baseRoute: string = 'http://localhost:8000';

// tslint:disable-next-line no-default-export
export default {
  debug: false,
  testing: false,
  processlist: {
    pageLimit: 10,
  },
  processengine: {
    poolingInterval: 30000,
    routes: {
      processes: `${baseRoute}/datastore/ProcessDef`,
      startProcess: `${baseRoute}/processengine/start`,
      processInstances: `${baseRoute}/datastore/Process`,
      messageBus: `${baseRoute}/mb`,
      iam: `${baseRoute}/iam`,
      userTasks: `${baseRoute}/datastore/UserTask`,
      importBPMN: `${baseRoute}/processengine/create_bpmn_from_xml`,
    },
  },
  events: {
    xmlChanged: 'xmlChanged',
    statusBar: {
      showXMLButton: 'statusbar:xmlbutton:show',
      hideXMLButton: 'statusbar:xmlbutton:hide',
      updateBaseRoute: 'statusbar:baseRoute:update',
    },
    navBar: {
      showTools: 'navbar:tools:show',
      hideTools: 'navbar:tools:hide',
      updateProcess: 'navbar:process:update',
    },
    processDefDetail: {
      saveDiagramm: 'processdefdetail:diagram:save',
      exportDiagramAs: 'processdefdetail:diagram:exportas',
      startProcess: 'processdefdetail:process:start',
      toggleXMLView: 'processdefdetail:xmlview:toggle',
    },
  },
  bpmnStudioClient: {
    baseRoute: baseRoute,
  },
  propertyPanel: {
    minWidth: 190,
    maxWidth: 300,
  },
  colorPickerSettings: {
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
};
