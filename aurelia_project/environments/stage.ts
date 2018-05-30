const processEngineRoute: string = 'http://localhost:8000';

// tslint:disable-next-line no-default-export
export default {
  debug: true,
  testing: false,
  processlist: {
    pageLimit: 10,
  },
  processengine: {
    poolingInterval: 10000,
    routes: {
      processes: `${processEngineRoute}/datastore/ProcessDef`,
      startProcess: `${processEngineRoute}/processengine/start`,
      processInstances: `${processEngineRoute}/datastore/Process`,
      messageBus: `${processEngineRoute}/mb`,
      iam: `${processEngineRoute}/iam`,
      userTasks: `${processEngineRoute}/datastore/UserTask`,
      importBPMN: `${processEngineRoute}/processengine/create_bpmn_from_xml`,
    },
  },
  events: {
    xmlChanged: 'xmlChanged',
    refreshProcessDefs: 'processdefs:refresh',
    statusBar: {
      showXMLButton: 'statusbar:xmlbutton:show',
      hideXMLButton: 'statusbar:xmlbutton:hide',
      updateProcessEngineRoute: 'statusbar:processEngineRoute:update',
    },
    navBar: {
      showTools: 'navbar:tools:show',
      hideTools: 'navbar:tools:hide',
      updateProcess: 'navbar:process:update',
      disableSaveButton: 'navbar:saveButton:disable',
      enableSaveButton: 'navbar:saveButton:enable',
    },
    processDefDetail: {
      saveDiagram: 'processdefdetail:diagram:save',
      exportDiagramAs: 'processdefdetail:diagram:exportas',
      startProcess: 'processdefdetail:process:start',
      toggleXMLView: 'processdefdetail:xmlview:toggle',
    },
    bpmnIo: {
      toggleProcessSolutionExplorer: 'bpmnio:processsolutionexplorer:toggle',
    },
  },
  bpmnStudioClient: {
    baseRoute: processEngineRoute,
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
