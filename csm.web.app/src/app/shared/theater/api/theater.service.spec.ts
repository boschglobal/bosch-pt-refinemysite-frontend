/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    NavigationExtras,
    Router
} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

import {MOCK_ATTACHMENTS} from '../../../../test/mocks/attachments';
import {AttachmentResource} from '../../../project/project-common/api/attachments/resources/attachment.resource';
import {TheaterService} from './theater.service';

describe('Theater Service', () => {
    let theaterService: TheaterService;
    let router: Router;

    const attachments: AttachmentResource[] = MOCK_ATTACHMENTS;
    const attachmentId: string = attachments[0].id;
    const openTheaterPath: any[] = [{outlets: {theater: 'theater'}}];
    const closeTheaterPath: any[] = [{outlets: {theater: null}}];
    const theaterNavigationExtras: NavigationExtras = {
        replaceUrl: true,
        queryParamsHandling: 'merge',
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            RouterTestingModule,
        ],
        providers: [
            {
                provide: Router,
                useValue: jasmine.createSpyObj('Router', ['navigate']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        theaterService = TestBed.inject(TheaterService);
        router = TestBed.inject(Router);
    });

    it('should set attachments and open the theater when "open" is called', () => {
        theaterService.open(attachments, attachmentId);

        expect(theaterService.attachments).toEqual(attachments);
        expect(theaterService.currentAttachmentId).toEqual(attachmentId);
        expect(router.navigate).toHaveBeenCalledWith(openTheaterPath, theaterNavigationExtras);
    });

    it('should clear attachments and close the theater when "close" is called', () => {
        theaterService.close();

        expect(theaterService.attachments).toEqual([]);
        expect(theaterService.currentAttachmentId).toBeNull();
        expect(router.navigate).toHaveBeenCalledWith(closeTheaterPath, theaterNavigationExtras);
    });
});
