/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';

import {
    MOCK_ATTACHMENT_1,
    MOCK_ATTACHMENT_2
} from '../../../../../test/mocks/attachments';
import {MockStore} from '../../../../../test/mocks/store';
import {ObjectListIdentifierPair} from '../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {AttachmentQueries} from './attachment.queries';

describe('Attachment Queries', () => {
    let attachmentQueries: AttachmentQueries;

    const includeChildren = true;
    const testDataItemId = '123';
    const testDataObjectIdentifier = new ObjectListIdentifierPair(ObjectTypeEnum.Task, testDataItemId, includeChildren);

    const moduleDef: TestModuleMetadata = {
        providers: [
            AttachmentQueries,
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            attachmentSlice: {
                                currentItem: {
                                    requestStatus: RequestStatusEnum.success
                                },
                                lists: {
                                    [testDataObjectIdentifier.stringify()]: {
                                        ids: [MOCK_ATTACHMENT_1.id, MOCK_ATTACHMENT_2.id],
                                        requestStatus: RequestStatusEnum.success,
                                        _links: {
                                            self: {
                                                href: ''
                                            }
                                        }
                                    }
                                },
                                items: [MOCK_ATTACHMENT_1, MOCK_ATTACHMENT_2]
                            },
                        }
                    }
                )
            },
            HttpClient,
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => attachmentQueries = TestBed.inject(AttachmentQueries));

    it('should observe attachments', () => {
        attachmentQueries
            .observeAttachments(ObjectTypeEnum.Task, testDataItemId, includeChildren)
            .subscribe((result: AttachmentResource[]) =>
                expect(result).toEqual([MOCK_ATTACHMENT_1, MOCK_ATTACHMENT_2]));
    });

    it('should observe attachments request status', () => {
        attachmentQueries
            .observeAttachmentsRequestStatus(ObjectTypeEnum.Task, testDataItemId, includeChildren)
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe current attachment request status', () => {
        attachmentQueries
            .observeCurrentAttachmentRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

});
