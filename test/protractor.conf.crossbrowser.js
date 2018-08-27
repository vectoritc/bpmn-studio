exports.config = {

  seleniumAddress: 'http://' + process.env.CB_USER +':'+ process.env.CB_KEY +'@hub.crossbrowsertesting.com:80/wd/hub',
  sessionId: null,

  multiCapabilities : [
    {
      name : '(Chrome68x64/W10) BPMN-Studio E2E Test',
      build: '4.2.0',
      browserName: 'Chrome',
      version: '68x64',
      platform: 'Windows 10',
      screenResolution: '1920x1080',
      record_video : true,
      record_network : true,
      record_snapshot : true,
    }, {
      name : '(Chrome66x64/Mac10.13) BPMN-Studio E2E Test',
      build: '4.2.0',
      browserName: 'Chrome',
      version: '66x64',
      platform: 'Mac OSX 10.13',
      screenResolution: '1920x1200',
      record_video : true,
      record_network : true,
      record_snapshot : true,
    }
  ],

  params: {
    aureliaUrl: process.env.aureliaUrl,
    processEngineUrl: process.env.processEngineUrl,
    defaultTimeoutMS: number = 30000,
  },

  specs: ['test/e2e/dist/*.js'],

  plugins: [{
    package: 'aurelia-protractor-plugin',
  }],

  framework: 'jasmine',

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
  },

  onPrepare: function() {
    beforeAll(() => {
      browser.driver.getSession().then(function(session) {
        this.sessionId = session.id_; //need for API calls
        console.log('Session ID: ', sessionId);
        console.log('See your test run at: https://app.crossbrowsertesting.com/selenium/' + sessionId);
      });
    });
    afterEach(() => {
        browser.executeScript('window.localStorage.clear();');
        browser.executeScript('window.sessionStorage.clear();');
        browser.driver.manage().deleteAllCookies();
    });
  },
};
