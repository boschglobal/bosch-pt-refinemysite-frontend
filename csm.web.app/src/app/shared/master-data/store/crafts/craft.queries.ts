/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {State} from '../../../../app.reducers';
import {CraftSlice} from './craft.slice';

export class CraftQueries {

    public moduleName = 'masterDataModule';

    public sliceName = 'craftSlice';

    /**
     * @description Retrieves selector function for craft slice
     * @returns {(state: State) => CraftSlice}
     */
    public getCraftSlice(): (state: State) => CraftSlice {
        return (state: State) => state[this.moduleName][this.sliceName];
    }
}
