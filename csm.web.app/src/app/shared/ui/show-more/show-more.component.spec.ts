/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
import {ShowMoreComponent} from './show-more.component';

describe('Show More Component', () => {
    let fixture: ComponentFixture<ShowMoreComponent>;
    let comp: ShowMoreComponent;

    const showLessGeneric = 'Generic_ShowLess';
    const showMoreGeneric = 'Generic_ShowMore';

    const moduleDef: TestModuleMetadata = {
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            ShowMoreComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ShowMoreComponent);
        comp = fixture.componentInstance;
    });

    it('should give the translation for initialization', () => {
        expect(comp.showMore.enabled).toBeFalsy();
        expect(comp.getText()).toEqual(showMoreGeneric);
    });

    it('should switch the translation after toggleShowMore', () => {
        comp.handleShowMore();
        expect(comp.showMore.enabled).toBeTruthy();
        expect(comp.getText()).toEqual(showLessGeneric);
    });

    it('should switch to default translation after toggleShowMore two times', () => {
        comp.handleShowMore();
        expect(comp.showMore.enabled).toBeTruthy();

        expect(comp.getText()).toEqual(showLessGeneric);

        comp.handleShowMore();
        expect(comp.showMore.enabled).toBeFalsy();
        expect(comp.getText()).toEqual(showMoreGeneric);
    });
});
