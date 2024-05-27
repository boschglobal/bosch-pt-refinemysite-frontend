/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ProjectCopyAction,
    ProjectCopyActionEnum
} from './project-copy.actions';

describe('ProjectCopy Actions', () => {
    it('should check ProjectCopyAction.Initialize.All() type', () => {
        expect(new ProjectCopyAction.Initialize.All().type)
            .toBe(ProjectCopyActionEnum.InitializeAll);
    });
    it('should check ProjectCopyAction.Copy.One() type', () => {
        expect(new ProjectCopyAction.Copy.One(null, null).type)
            .toBe(ProjectCopyActionEnum.CopyOne);
    });
    it('should check ProjectCopyAction.Copy.OneFulfilled() type', () => {
        expect(new ProjectCopyAction.Copy.OneFulfilled(null).type)
            .toBe(ProjectCopyActionEnum.CopyOneFulfilled);
    });
    it('should check ProjectCopyAction.Copy.OneRejected() type', () => {
        expect(new ProjectCopyAction.Copy.OneRejected().type)
            .toBe(ProjectCopyActionEnum.CopyOneRejected);
    });
    it('should check ProjectCopyAction.Copy.OneReset() type', () => {
        expect(new ProjectCopyAction.Copy.OneReset().type)
            .toBe(ProjectCopyActionEnum.CopyOneReset);
    });
});
