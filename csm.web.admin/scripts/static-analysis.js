/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

const scanner = require('sonarqube-scanner');
const properties = require('properties');
const exec = require('child_process').exec;

const getCommandLineArgs = () => {
    return process.argv
        .slice(2)
        .reduce((acc, arg) => {
            const [key, value] = arg.split('=');
            return {...acc, [key]: value};
        }, {});
};

const getBranchName = async () => {
    return new Promise((resolve, reject) => {
        exec('git rev-parse --abbrev-ref HEAD', (err, stdout) => {
            if (err) {
                reject(err);
            } else {
                resolve(stdout.replace(/\n/g, ''));
            }
        });
    })
};

const getSystemProps = async () => {
    return new Promise((resolve, reject) => {
        properties.parse(`${process.env.HOME}/.gradle/gradle.properties`, {
            path: true,
            namespaces: true
        }, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    })
};

(async () => {
    try {
        const {version: buildVersion, sourceBranchName, buildReason: buildReasonName} = getCommandLineArgs();
        const systemProps = !sourceBranchName ? await getSystemProps() : null;
        const version = buildVersion || '1.0.0';
        const buildReason = buildReasonName || 'Build';
        const sourceBranch = sourceBranchName || `${await getBranchName()}-local`;
        const options = {};

        console.info(`${buildReason} for branch ${sourceBranch}`);

        // If the pull request was manually triggered the BuildReason is 'Manual', else 'PullRequest'.
        // Whether the BuildReason is 'PullRequest' or 'Manual' we assume that a pull request has a SourceBranchName 'merge'.
        if ('merge' !== sourceBranch) {
            options['sonar.branch.name'] = sourceBranch;
        }

        if (systemProps) {
            options['sonar.host.url'] = systemProps.systemProp.sonar.host.url;
            options['sonar.login'] = systemProps.systemProp.sonar.login;
        }

        scanner({
            options: {
                ...options,
                'sonar.projectKey': 'csm.web.admin',
                'sonar.projectName': 'csm.web.admin',
                'sonar.projectVersion': version,
                'sonar.sourceEncoding': 'UTF-8',
                'sonar.sources': 'src/app',
                'sonar.eslint.reportPaths':'eslint-report.json',
                'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
                'sonar.exclusions': '**/node_modules/**,**/*.spec.ts,**/*.mock.ts,**/*.test.component.ts,src/polyfills.ts',
                'sonar.tests': 'src/test',
                'sonar.test.inclusions': '**/*spec.ts',
                'sonar.issue.ignore.multicriteria': 'r1,r2,r3,r4',
                'sonar.issue.ignore.multicriteria.r1.ruleKey': 'typescript:S107',
                'sonar.issue.ignore.multicriteria.r1.resourceKey': '**/*.ts',
                'sonar.issue.ignore.multicriteria.r2.ruleKey': 'typescript:S2933',
                'sonar.issue.ignore.multicriteria.r2.resourceKey': '**/*.ts',
                'sonar.issue.ignore.multicriteria.r3.ruleKey': 'typescript:S1479',
                'sonar.issue.ignore.multicriteria.r3.resourceKey': '**/*.reducer.ts',
                'sonar.issue.ignore.multicriteria.r4.ruleKey': 'typescript:S138',
                'sonar.issue.ignore.multicriteria.r4.resourceKey': '**/*.reducer.ts'
            }
        });
    } catch (err) {
        console.error(err);
    }
})();
