/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

export const MOCK_CALENDAR = [
    {
        id: '123',
        name: 'name1',
        position: 1,
        records: [
            {
                end: moment('2018-10-27'),
                id: '123',
                position: null,
                start: moment('2018-10-21'),
            },
            {
                end: moment('2018-11-04'),
                id: '456',
                position: null,
                start: moment('2018-10-04')
            },
            {
                end: moment('2018-11-04'),
                id: '555',
                position: null,
                start: moment('2018-10-04')
            },
            {
                end: moment('2018-11-09'),
                id: '789',
                position: null,
                start: moment('2018-11-05')
            },
            {
                end: moment('2018-11-09'),
                id: '091',
                position: null,
                start: moment('2018-11-05')
            },
            {
                end: moment('2018-11-18'),
                id: '111',
                position: null,
                start: moment('2018-11-12')
            },
            {
                end: moment('2018-11-25'),
                id: '222',
                position: null,
                start: moment('2018-11-19')
            },
            {
                end: moment('2018-11-30'),
                id: '333',
                position: null,
                start: moment('2018-11-19')
            },
            {
                end: moment('2018-11-03'),
                id: '587',
                position: null,
                start: moment('2018-10-29')
            },
            {
                end: moment('2018-10-27'),
                id: '1234',
                position: null,
                start: moment('2018-10-23')
            },
        ]
    },
    {
        id: '456',
        name: 'name2',
        position: 2,
        records: [
            {
                end: moment('2018-10-26'),
                id: '1232',
                position: null,
                start: moment('2018-10-15')
            },
            {
                end: moment('2018-11-02'),
                id: '4562',
                position: null,
                start: moment('2018-10-29')
            },
            {
                end: moment('2018-11-23'),
                id: '7892',
                position: null,
                start: moment('2018-11-19')
            },
            {
                end: moment('2018-11-11'),
                id: '9992',
                position: null,
                start: moment('2018-11-11')
            },
            {
                end: moment('2018-10-22'),
                id: '9993',
                position: null,
                start: moment('2018-10-22')
            },
            {
                end: moment('2018-12-02'),
                id: '9994',
                position: null,
                start: moment('2018-12-02')
            }
        ]
    },
    {
        id: '55555',
        name: 'name 3',
        position: 3,
        records: []
    },
    {
        id: '6666',
        name: 'name 4',
        position: 4,
        records: []
    },
    {
        id: '7777',
        name: 'name 5',
        position: 5,
        records: []
    },
    {
        id: '8888',
        name: 'name 6',
        position: 6,
        records: []
    },
    {
        id: null,
        name: 'without area',
        position: null,
        records: [
            {
                end: moment('2018-11-09'),
                id: '1235',
                position: null,
                start: moment('2018-10-29')
            }
        ]
    }
];
