/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';

import {SharedModule} from '../shared/shared.module';
import {LegalDocumentsEffects} from './store/legal-documents/legal-documents.effects';
import {PATEffects} from './store/pats/pat.effects';
import {UserEffects} from './store/user/user.effects';
import {UserComponent} from './user.component';
import {UserChildrenModule} from './user-children/user-children.module';
import {UserCommonModule} from './user-common/user-common.module';
import {UserRoutingModule} from './user-routing/user-routing.module';
import {USER_ROUTES} from './user-routing/user-routing.routes';

@NgModule({
    imports: [
        EffectsModule.forFeature([
            LegalDocumentsEffects,
            PATEffects,
            UserEffects,
        ]),
        SharedModule,
        UserChildrenModule,
        UserCommonModule,
        UserRoutingModule,
        RouterModule.forChild(USER_ROUTES),
    ],
    declarations: [
        UserComponent,
    ],
})
export class UserModule {
}
