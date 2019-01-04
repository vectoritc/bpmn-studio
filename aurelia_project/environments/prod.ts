const processEngineRoute: string = 'http://localhost:8000';
const electronHost: string = 'bpmn-studio:/';

const isRunningInElectron: boolean = Boolean((window as any).nodeRequire);

// tslint:disable-next-line no-default-export
export default {
  debug: false,
  testing: false,
  appHost: isRunningInElectron
    ? electronHost
    : `http://${window.location.host}`,
  processlist: {
    pageLimit: 10,
  },
  openIdConnect: {
    authority: 'http://localhost:5000',
    defaultAuthority: 'http://localhost:5000',
  },
  processengine: {
    liveExecutionTrackerPollingIntervalInMs: 1000,
    solutionExplorerPollingIntervalInMs: 5000,
    processDefListPollingIntervalInMs: 5000,
    dashboardPollingIntervalInMs: 1500,
    routes: {
      processes: `${processEngineRoute}/datastore/ProcessDef`,
      startProcess: `${processEngineRoute}/processengine/start`,
      iam: `${processEngineRoute}/iam`,
      userTasks: `${processEngineRoute}/datastore/UserTask`,
      importBPMN: `${processEngineRoute}/processengine/create_bpmn_from_xml`,
    },
  },
  events: {
    differsFromOriginal: 'differsFromOriginal',
    xmlChanged: 'xmlChanged',
    refreshProcessDefs: 'processdefs:refresh',
    statusBar: {
      showDiagramViewButtons: 'statusbar:diagramviewbuttons:show',
      hideDiagramViewButtons: 'statusbar:diagramviewbuttons:hide',
      setXmlIdentifier: 'statusbar:xmlIdentifier',
      showInspectCorrelationButtons: 'statusbar:inspectcorrelationbuttons',
    },
    configPanel: {
      processEngineRouteChanged: 'configpanel:processEngineRoute:changed',
    },
    navBar: {
      showTools: 'navbar:tools:show',
      hideTools: 'navbar:tools:hide',
      validationError: 'navbar:validationError:true',
      noValidationError: 'navbar:validationError:false',
      inspectNavigateToDashboard: 'navbar:inspectLink:navigateToDashboard',
      showInspectButtons: 'navbar:tools:showButtonsOnInspect',
      hideInspectButtons: 'navbar:tools:hideButtonsOnInspect',
      toggleDashboardView: 'navbar:tools:inspectButtons:toggleDashboardView',
      toggleHeatmapView: 'navbar:tools:inspectButtons:toggleHeatmapView',
      toggleInspectCorrelationView: 'navbar:tools:inspectButtons:toggleInspectCorrelationView',
      diagramChangesResolved: 'navbar:diagram:changesResolved',
      updateActiveSolutionAndDiagram: 'navbar:activeSolution:diagram:update',
    },
    diagramDetail: {
      onDiagramDeployed: 'diagramdetail:diagram:ondeployed',
      printDiagram: 'diagramdetail:diagram:print',
      saveDiagram: 'diagramdetail:diagram:save',
      exportDiagramAs: 'diagramdetail:diagram:exportas',
      startProcess: 'diagramdetail:process:start',
      startProcessWithOptions: 'diagramdetail:process:startWithOptions',
      toggleXMLView: 'design:xmlview:toggle',
      uploadProcess: 'diagramdetail:process:upload',
      suppressUnsavedChangesModal: 'diagramdetail:view:suppressUnsavedChangesModal',
    },
    bpmnio: {
      toggleXMLView: 'design:xmlview:toggle',
      toggleDiffView: 'design:diffview:toggle',
      showDiffDestinationButton: 'design:diffDestinationButton:toggle',
      togglePropertyPanel: 'design:propertypanel:toggle',
      propertyPanelActive: 'design:propertypanel:active',
    },
    diffView: {
      changeDiffMode: 'diffview:diffmode:change',
      toggleChangeList: 'diffview:changelist:toggle',
      setDiffDestination: 'diffview:diffDestination:set',
    },
    diagramChange: 'diagram:change',
    processSolutionPanel: {
      toggleProcessSolutionExplorer: 'processSolutionPanel:processsolutionexplorer:toggle',
      navigateToInspect: 'processSolutionPanel:processEngineLinks:navigateToInspect',
      navigateToDesigner: 'processSolutionPanel:processEngineLinks:navigateToDesigner',
    },
    inspectView: {
      showInspectPanel: 'inspectView:inspectPanel:show',
    },
  },
  baseRoute: processEngineRoute,
  propertyPanel: {
    defaultWidth: 250,
  },
  colorPickerSettings: {
    preferredFormat: 'hex',
    clickoutFiresChange: true,
    showPalette: true,
    maxSelectionSize: 8,
    showInitial: true,
    showInput: true,
    allowEmpty: true,
    showButtons: false,
    containerClassName: 'colorpicker-container',
  },
};
