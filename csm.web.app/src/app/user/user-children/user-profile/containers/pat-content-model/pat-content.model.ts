/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {PATResource} from '../../../../../project/project-common/api/pats/resources/pat.resource';
import {PatScopeEnum} from '../../../../user-common/enums/pat.enum';

export class PatContentModel {
    public description?: string;
    public expiresAt: string;
    public id: string;
    public scopes: string;
    public options: string;

    public static fromPATResource(patResource: PATResource): PatContentModel {
        const {
            description,
            expiresAt,
            id,
        } = patResource;
        const scopes = patResource.scopes.map(scope => PatScopeEnum[scope]).join(', ');

        return {
            description,
            expiresAt,
            id,
            options: id,
            scopes,
        };
    }
}
