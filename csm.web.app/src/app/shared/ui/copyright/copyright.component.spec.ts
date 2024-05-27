/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {TranslationModule} from '../../translation/translation.module';
import {CopyrightComponent} from './copyright.component';

describe('Copyright Component', () => {
    let component: CopyrightComponent;
    let fixture: ComponentFixture<CopyrightComponent>;

    const moduleDef: TestModuleMetadata = {
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            CopyrightComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CopyrightComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeDefined();
    });
});
