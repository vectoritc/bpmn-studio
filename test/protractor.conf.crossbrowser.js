exports.config = {
  
    // change this to your USERNAME and AUTHKEY
    seleniumAddress: 'http://' + process.env.CB_USER +':'+ process.env.CB_KEY +'@hub.crossbrowsertesting.com:80/wd/hub',
  
    capabilities : {
  
      name : 'BPMN Studio test',

      build: '1.0',
      browserName: 'Chrome',
      version: '68x64',
      platform: 'Windows 10',
      screenResolution: '1920x1080',
      record_video : true,
      record_network : true,
      record_snapshot : true,
    },

    params: {
        aureliaUrl: process.env.aureliaUrl
    },
  
    specs: ['test/e2e/dist/*.js'],

    plugins: [{
        package: 'aurelia-protractor-plugin',
    }],

    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000
    }
  };
  