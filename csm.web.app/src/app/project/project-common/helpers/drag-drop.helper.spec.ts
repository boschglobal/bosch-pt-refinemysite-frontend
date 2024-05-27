/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {KeyEnum} from '../../../shared/misc/enums/key.enum';
import {DragDropHelper} from './drag-drop.helper';

interface MockRecord {
    id: string;
    description: string;
}

describe('Drag Drop Helper', () => {

    let dragDropHelper: DragDropHelper<MockRecord>;

    const mockRecord: MockRecord = {
        id: '1',
        description: 'foo'
    };
    const keyUpEvent: any = new Event('keyup');

    beforeEach(() => {
        dragDropHelper = new DragDropHelper();
    });

    it('should emit onDragStarted when a drag start', () => {
        let emittedRecord = null;

        dragDropHelper.onDragStarted().subscribe(record => emittedRecord = record);
        dragDropHelper.startDrag(mockRecord);

        expect(emittedRecord).toBe(mockRecord);
    });

    it('should emit onDragEnded when a drag ends', () => {
        let emittedRecord = null;

        dragDropHelper.onDragEnded().subscribe(record => emittedRecord = record);
        dragDropHelper.startDrag(mockRecord);
        dragDropHelper.endDrag();

        expect(emittedRecord).toBe(mockRecord);
    });

    it('should set record when drag start', () => {
        dragDropHelper.startDrag(mockRecord);

        expect(dragDropHelper.getRecordBeingDragged()).toBe(mockRecord);
    });

    it('should unset record when drag end', () => {
        dragDropHelper.startDrag(mockRecord);
        dragDropHelper.endDrag();

        expect(dragDropHelper.getRecordBeingDragged()).toBeFalsy();
    });

    it('should mark drag has not canceled when start dragging', () => {
        dragDropHelper.startDrag(mockRecord);
        expect(dragDropHelper.isDragCanceled()).toBeFalsy();
    });

    it('should cancel drag when ESCAPE key is pressed', () => {
        dragDropHelper.startDrag(mockRecord);
        keyUpEvent.key = KeyEnum.Escape;
        window.dispatchEvent(keyUpEvent);

        expect(dragDropHelper.isDragCanceled()).toBeTruthy();
    });

    it('should not cancel drag when ESCAPE key is pressed and drag ended', () => {
        dragDropHelper.startDrag(mockRecord);
        dragDropHelper.endDrag();
        keyUpEvent.key = KeyEnum.Escape;
        window.dispatchEvent(keyUpEvent);

        expect(dragDropHelper.isDragCanceled()).toBeFalsy();
    });

    it('should mark drag has canceled when cancel drag is called', () => {
        dragDropHelper.startDrag(mockRecord);
        dragDropHelper.cancelDrag();
        expect(dragDropHelper.isDragCanceled()).toBeTruthy();
    });
});
