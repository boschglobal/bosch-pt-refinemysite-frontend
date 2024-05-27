/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CompanyResource} from '../../../../app/project/project-common/api/companies/resources/company.resource';
import {
    CompanyListResource,
    CompanyListResourceLinks
} from '../../../../app/project/project-common/api/companies/resources/company-list.resource';
import {CompanyReferenceListResource} from '../../../../app/project/project-common/api/companies/resources/company-reference-list.resource';
import {ResourceReference} from '../../../../app/shared/misc/api/datatypes/resource-reference.datatype';

export const TEST_COMPANY_1: CompanyResource = {
    id: '1',
    name: 'Company_1',
    _links: {
        self: {
            href: 'self',
        },
    },
};

export const TEST_COMPANY_2: CompanyResource = {
    id: '2',
    name: 'Company_2',
    _links: {
        self: {
            href: 'self',
        },
    },
};

export const TEST_COMPANY_LIST: CompanyListResource = {
    companies: [TEST_COMPANY_1, TEST_COMPANY_2],
    _links: new CompanyListResourceLinks(),
};

export const TEST_COMPANY_1_REFERENCE: ResourceReference = {
    id: '1',
    displayName: 'Company_1',
};

export const TEST_COMPANY_2_REFERENCE: ResourceReference = {
    id: '2',
    displayName: 'Company_2',
};

export const TEST_COMPANY_REFERENCE_LIST: CompanyReferenceListResource = {
    companies: [TEST_COMPANY_1_REFERENCE, TEST_COMPANY_2_REFERENCE],
    pageNumber: 0,
    pageSize: 500,
    totalElements: 20,
    totalPages: 1,
};
