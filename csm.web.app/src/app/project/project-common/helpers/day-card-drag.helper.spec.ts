/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DayCardDragHelper} from './day-card-drag.helper';

describe('Day Card Drag Helper', () => {

    let dayCardDragHelper: DayCardDragHelper;

    beforeEach(() => {
        dayCardDragHelper = new DayCardDragHelper();
    });

    it('should emit onDragValidityChange when set drag validity is called', () => {
        let result = true;

        dayCardDragHelper.onDragValidityChange().subscribe(isValid => result = isValid);
        dayCardDragHelper.setDraggingValidity(false);

        expect(result).toBeFalsy();
    });

    it('should emit onConnectedDropListsChange when new lists are connected', () => {
        const listToConnect = ['connected-list-id-1', 'connected-list-id-2', 'connected-list-id-3'];
        let result = [];

        dayCardDragHelper.onConnectedDropListsChange().subscribe(connectedLists => result = connectedLists);
        dayCardDragHelper.connectDropLists(listToConnect);

        expect(result).toEqual(listToConnect);
    });

    it('should emit onConnectedDropListsChange when new lists are disconnected', () => {
        const listToConnect = ['connected-list-id-1', 'connected-list-id-2', 'connected-list-id-3'];
        const listToDisconnect = ['connected-list-id-1', 'connected-list-id-2'];
        let result = [];

        dayCardDragHelper.onConnectedDropListsChange().subscribe(connectedLists => result = connectedLists);
        dayCardDragHelper.connectDropLists(listToConnect);

        expect(result).toEqual(listToConnect);

        dayCardDragHelper.disconnectDropLists(listToDisconnect);

        expect(result).toEqual(listToConnect.filter(list => !listToDisconnect.includes(list)));
    });

    it('should store all connected lists without duplicates', () => {
        const listToConnect1 = ['connected-list-id-1', 'connected-list-id-2'];
        const listToConnect2 = ['connected-list-id-1', 'connected-list-id-2', 'connected-list-id-3', 'connected-list-id-4'];
        const expectedResult = listToConnect2;
        let result = [];

        dayCardDragHelper.onConnectedDropListsChange().subscribe(connectedLists => result = connectedLists);
        dayCardDragHelper.connectDropLists(listToConnect1);
        dayCardDragHelper.connectDropLists(listToConnect2);

        expect(result).toEqual(expectedResult);
    });
});
