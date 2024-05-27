/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {cloneDeep} from 'lodash';

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {ProjectExportResource} from '../../api/project-export/resources/project-export.resource';
import {ProjectExportFormatEnum} from '../../enums/project-export-format.enum';
import {ProjectExportSchedulingTypeEnum} from '../../enums/project-export-scheduling-type.enum';
import {ProjectExportAction} from './project-export.actions';
import {PROJECT_EXPORT_INITIAL_STATE} from './project-export.initial-state';
import {PROJECT_EXPORT_REDUCER} from './project-export.reducer';
import {ProjectExportSlice} from './project-export.slice';

describe('Project Export Reducer', () => {
    let initialState: ProjectExportSlice;
    let nextState: ProjectExportSlice;
    const projectExportResource: ProjectExportResource = {
        format: ProjectExportFormatEnum.PrimaveraP6,
        includeComments: false,
        milestoneExportSchedulingType: ProjectExportSchedulingTypeEnum.ManuallyScheduled,
        taskExportSchedulingType: ProjectExportSchedulingTypeEnum.AutoScheduled,
    };

    beforeEach(() => {
        initialState = PROJECT_EXPORT_INITIAL_STATE;
        nextState = cloneDeep(PROJECT_EXPORT_INITIAL_STATE);
        new ProjectExportAction.Initialize.All();
    });

    it('should handle ProjectExportAction.InitializeAll', () => {
        const action = new ProjectExportAction.Initialize.All();
        expect(PROJECT_EXPORT_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle ProjectExportAction.Export.One', () => {
        const action = new ProjectExportAction.Export.One('foo', projectExportResource);

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_EXPORT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectExportAction.Export.OneFulfilled', () => {
        const action = new ProjectExportAction.Export.OneFulfilled('foo');

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });

        expect(PROJECT_EXPORT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectExportAction.Export.OneRejected', () => {
        const action = new ProjectExportAction.Export.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_EXPORT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectExportAction.Export.OneReset', () => {
        const action = new ProjectExportAction.Export.OneReset();

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
        });

        expect(PROJECT_EXPORT_REDUCER(initialState, action)).toEqual(nextState);
    });
});
