/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

const checker = require('license-checker');
const spdxCorrect = require('spdx-correct');

const options = {
    start: './',
    production: true,
    excludePackages: 'smartsite-web-app@1.0.0',
};

const blacklist = [
    'AGPL-1.0-only',
    'AGPL-3.0-or-later',
    'GPL-2.0-only',
    'GPL-3.0-or-later',
];

checker.init(options, function (err, dependencies) {
    if (err) {
        console.error(err);
        process.exit(1);
    } else {
        const undesiredDependencies = findUndesiredDependencies(dependencies, blacklist);

        if (hasUndesiredDependencies(undesiredDependencies)) {
            console.error('UNDESIRED DEPENDENCIES:');
            console.error(checker.asTree(undesiredDependencies));
            console.info('SUMMARY:');
            console.info(checker.asSummary(dependencies));
            process.exit(1);
        } else {
            console.info('DEPENDENCIES:');
            console.info(checker.asTree(dependencies));
            console.info('SUMMARY:');
            console.info(checker.asSummary(dependencies));
            process.exit(0);
        }
    }
});

const findUndesiredDependencies = (dependencies, blacklist) => {
    return Object
        .entries(dependencies)
        .reduce((undesiredDependencies, [dependency, dependencyData]) => {
            return blacklist.includes(spdxCorrect(dependencyData.licenses))
                ? {...undesiredDependencies, [dependency]: dependencyData}
                : undesiredDependencies;
        }, {});
};

const hasUndesiredDependencies = (undesiredDependencies) => {
    return Object.keys(undesiredDependencies).length;
};
