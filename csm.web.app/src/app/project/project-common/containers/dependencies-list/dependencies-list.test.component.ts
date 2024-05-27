/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {DependenciesListRelationsObservables} from './dependencies-list.component';

@Component({
    templateUrl: './dependencies-list.test.component.html',
})
export class DependenciesListTestComponent {

    public originator: ObjectIdentifierPair;

    public canAddDependencies: boolean;

    public relationsObservables: DependenciesListRelationsObservables;
}
