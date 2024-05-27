/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {ActivatedRouteStub} from '../../../../../test/stubs/activated-route.stub';
import {TranslationModule} from '../../../translation/translation.module';
import {NavBarItem} from '../navbar-component/navbar.component';
import {NavbarItemComponent} from './navbar-item.component';

describe('NavBarItem Component', () => {
    let fixture: ComponentFixture<NavbarItemComponent>;
    let comp: NavbarItemComponent;

    const translateServiceMock: TranslateService = mock(TranslateService);

    const dynamicLabel = 'DynamicLabel';
    const translatedLabel = 'TranslatedLabel';

    const mockNavBarItemStatic: NavBarItem = {
        dynamicLabel: null,
        staticLabel: 'StaticItemLabel',
        url: 'mockurl',
        icon: 'list',
        permissions: true,
        isFeatureActive: true,
        exact: false,
    };

    const mockNavBarItemDynamic: NavBarItem = {
        dynamicLabel: of(dynamicLabel),
        staticLabel: null,
        url: 'mockurl',
        icon: 'list',
        permissions: true,
        isFeatureActive: true,
        exact: false,
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
            NoopAnimationsModule,
        ],
        providers: [
            {
                provide: TranslateService,
                useFactory: () => instance(translateServiceMock),
            },
            {
                provide: ActivatedRoute,
                useClass: ActivatedRouteStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavbarItemComponent);
        comp = fixture.componentInstance;

        when(translateServiceMock.get(mockNavBarItemStatic.staticLabel)).thenReturn(of(translatedLabel));

        comp.item = mockNavBarItemStatic;

    });

    it('should set a translated label when NavBarItem has a static label', () => {
        comp.item = mockNavBarItemStatic;
        fixture.detectChanges();

        expect(comp.label).toEqual(translatedLabel);
    });

    it('should set label when NavBarItem has a dynamic label', () => {
        comp.item = mockNavBarItemDynamic;
        fixture.detectChanges();

        expect(comp.label).toEqual(dynamicLabel);
    });
});
