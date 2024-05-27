/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: [
            'jasmine',
            '@angular-devkit/build-angular',
            'viewport',
        ],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage'),
            require('karma-spec-reporter'),
            require('karma-viewport'),
            require('@angular-devkit/build-angular/plugins/karma'),
        ],
        client: {
            jasmine: {
                random: false
            },
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },
        coverageReporter: {
            dir: require('path').join(__dirname, '../coverage'),
            subdir: '.',
            reporters: [
                { type: 'html' },
                { type: 'lcovonly' },
                { type: 'text-summary' },
                { type: 'cobertura' },
            ]
        },
        angularCli: {
            environment: 'dev'
        },
        reporters: ['spec'],
        specReporter: {
            maxLogLines: 5,
            suppressErrorSummary: false,
            suppressFailed: false,
            suppressPassed: false,
            suppressSkipped: true,
            showSpecTiming: false,
            failFast: false
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_ERROR,
        autoWatch: false,
        browsers: ['ChromeHeadless'],
        browserDisconnectTolerance: 3,
        browserDisconnectTimeout: 10000,
        browserNoActivityTimeout: 100000,
        captureTimeout: 300000,
        browserSocketTimeout: 300000,
        pingTimeout: 300000,
        customLaunchers: {
            ChromeHeadless: {
                base: 'Chrome',
                flags: [
                    '--no-sandbox',
                    '--headless',
                    '--use-gl=angle',
                    '--remote-debugging-port=9222',
                    '--window-size=1920,1200',
                    '--disable-translate',
                    '--disable-extensions'
                ]
            }
        },
        singleRun: true
    });
};
