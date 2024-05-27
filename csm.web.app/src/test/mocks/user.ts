/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../app/shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {RequestStatusEnum} from '../../app/shared/misc/enums/request-status.enum';
import {UserResource} from '../../app/user/api/resources/user.resource';
import {UserSlice} from '../../app/user/store/user/user.slice';

export const TEST_USER_RESOURCE_UNREGISTERED: UserResource = {
    id: '6ccc8f21-42a7-25e3-77de-d213c23a796d',
    firstName: '',
    lastName: '',
    gender: '',
    email: 'abc@de.de',
    position: '',
    eulaAccepted: false,
    roles: [],
    crafts: [],
    phoneNumbers: [],
    createdBy: new ResourceReference('1', 'SYSTEM'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'SYSTEM'),
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    version: 0,
    _embedded: {
        profilePicture: {
            id: '',
            createdBy: new ResourceReferenceWithPicture('1', 'SYSTEM', ''),
            lastModifiedBy: new ResourceReference('1', 'SYSTEM'),
            createdDate: '2016-10-01T00:00:00.000Z',
            lastModifiedDate: '2016-10-01T00:00:00.000Z',
            width: 100,
            height: 100,
            fileSize: 1000,
            version: 1,
            userReference: {
                id: '',
                displayName: ''
            },
            _links: {
                self: {
                    href: ''
                },
                full: {
                    href: ''
                },
                small: {
                    href: ''
                }
            }
        }
    },
    _links: {
        self: {
            href: '/user/6ccc8f21-42a7-25e3-77de-d213c23a796d'
        },
        register: {
            href: '/user/register'
        },
        update: {
            href: '/user/6ccc8f21-42a7-25e3-77de-d213c23a796c'
        }
    }
};

export const TEST_USER_RESOURCE_REGISTERED: UserResource = {
    id: '6ccc8f21-42a7-25e3-77de-d213c23a796c',
    firstName: 'First Name',
    lastName: 'Last Name',
    gender: 'MALE',
    email: 'abc@de.de',
    position: 'barkeeper',
    eulaAccepted: true,
    roles: [],
    crafts: [new ResourceReference('1', 'a'), new ResourceReference('2', 'z')],
    phoneNumbers: [
        {
            countryCode: '+351',
            phoneNumber: '123456789',
            phoneNumberType: 'MOBILE'
        }
    ],
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    version: 0,
    _embedded: {
        profilePicture: {
            id: '',
            createdBy: new ResourceReferenceWithPicture('1', 'SYSTEM', ''),
            lastModifiedBy: new ResourceReference('1', 'SYSTEM'),
            createdDate: '2016-10-01T00:00:00.000Z',
            lastModifiedDate: '2016-10-01T00:00:00.000Z',
            width: 100,
            height: 100,
            fileSize: 1000,
            version: 1,
            userReference: {
                id: '',
                displayName: ''
            },
            _links: {
                self: {
                    href: 'self'
                },
                full: {
                    href: 'full'
                },
                small: {
                    href: 'small'
                },
                delete: {
                    href: 'delete'
                }
            }
        }
    },
    _links: {
        self: {
            href: '/user/6ccc8f21-42a7-25e3-77de-d213c23a796c'
        },
        update: {
            href: '/user/6ccc8f21-42a7-25e3-77de-d213c23a796c'
        }
    }
};

export const TEST_USER_RESOURCE_FAX: UserResource = {
    id: '6ccc8f21-42a7-25e3-77de-d213c23a796c',
    firstName: 'First Name',
    lastName: 'Last Name',
    gender: 'MALE',
    email: 'abc@de.de',
    position: 'barkeeper',
    eulaAccepted: true,
    roles: [],
    crafts: [],
    phoneNumbers: [
        {
            countryCode: '+351',
            phoneNumber: '123456789',
            phoneNumberType: 'FAX'
        }
    ],
    createdBy: new ResourceReference('1', 'Bob Baumeister'),
    createdDate: '2016-10-01T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    version: 0,
    _embedded: {
        profilePicture: {
            id: '',
            createdBy: new ResourceReferenceWithPicture('1', 'SYSTEM', ''),
            lastModifiedBy: new ResourceReference('1', 'SYSTEM'),
            createdDate: '2016-10-01T00:00:00.000Z',
            lastModifiedDate: '2016-10-01T00:00:00.000Z',
            width: 100,
            height: 100,
            fileSize: 1000,
            version: 1,
            userReference: {
                id: '',
                displayName: ''
            },
            _links: {
                self: {
                    href: ''
                },
                full: {
                    href: ''
                },
                small: {
                    href: ''
                }
            }
        }
    },
    _links: {
        self: {
            href: '/user/6ccc8f21-42a7-25e3-77de-d213c23a796c'
        },
        register: undefined,
        update: {
            href: '/user/6ccc8f21-42a7-25e3-77de-d213c23a796c'
        }
    }
};

export const TEST_USER_SLICE: UserSlice = {
    currentItem: {
        id: TEST_USER_RESOURCE_REGISTERED.id,
        requestStatus: RequestStatusEnum.success,
        dataRequestStatus: RequestStatusEnum.success,
        pictureRequestStatus: RequestStatusEnum.success,
    },
    items: [TEST_USER_RESOURCE_REGISTERED],
    privacySettings: {
        version: 1,
        comfort: false,
        performance: true,
        lastModifiedDate: new Date(),
    }
};

export const TEST_PROJECT_CARD_CONTACT = {
    contactName: `${TEST_USER_SLICE.items[0].firstName} ${TEST_USER_SLICE.items[0].lastName}`,
    position: TEST_USER_SLICE.items[0].position,
    phoneNumbers: TEST_USER_SLICE.items[0].phoneNumbers
};
