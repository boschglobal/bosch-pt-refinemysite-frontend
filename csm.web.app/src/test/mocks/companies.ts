/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    CompanyListResource,
    CompanyListResourceLinks
} from '../../app/project/project-common/api/companies/resources/company-list.resource';
import {CompanyResource} from '../../app/project/project-common/api/companies/resources/company.resource';

export const MOCK_COMPANY_1: CompanyResource = {
    id: '1',
    name: 'Company_1',
    _links: {
        self: {
            href: 'self'
        }
    }
};

export const MOCK_COMPANY_2: CompanyResource = {
    id: '2',
    name: 'Company_2',
    _links: {
        self: {
            href: 'self'
        }
    }
};

export const MOCK_COMPANY_3: CompanyResource = {
    id: '3',
    name: 'Company_3',
    _links: {
        self: {
            href: 'self'
        }
    }
};

export const MOCK_COMPANY_LIST: CompanyListResource = {

    companies: [MOCK_COMPANY_1, MOCK_COMPANY_2],
    _links: new CompanyListResourceLinks

};
