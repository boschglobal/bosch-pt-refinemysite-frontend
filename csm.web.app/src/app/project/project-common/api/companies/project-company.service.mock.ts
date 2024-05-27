/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Observable,
    of
} from 'rxjs';

import {TEST_COMPANY_REFERENCE_LIST} from '../../../../../test/company/api/testdata/company.testdata';
import {CompanyReferenceListResource} from './resources/company-reference-list.resource';

export class ProjectCompanyServiceMock {
    findAll(projectId: string, pageNumber = 0, size = 100): Observable<CompanyReferenceListResource> {
        return of(TEST_COMPANY_REFERENCE_LIST);
    }
}
