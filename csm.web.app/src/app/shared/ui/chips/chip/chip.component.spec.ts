/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {BlobServiceStub} from '../../../../../test/stubs/blob.service.stub';
import {BlobService} from '../../../rest/services/blob.service';
import {BackgroundImageDirective} from '../../directives/background-image.directive';
import {
    Chip,
    ChipComponent
} from './chip.component';
import {ChipTestComponent} from './chip.test.component';

describe('Chip Component', () => {
    let fixture: ComponentFixture<ChipTestComponent>;
    let testHostComp: ChipTestComponent;
    let comp: ChipComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const textChipItem: Chip = {
        id: '1',
        text: 'item',
    };
    const iconChipItem: Chip = {
        id: '1',
        text: 'item',
        icon: {
            name: 'icon-name',
            color: '#000',
        },
    };
    const imageChipItem: Chip = {
        id: '1',
        text: 'item',
        imageUrl: '/image.jpg',
    };
    const customVisualContentChipItem: Chip = {
        id: '1',
        text: 'item',
        customVisualContent: {
            template: null,
            data: 'rgb(17, 17, 17)',
        },
    };
    const clickEvent = new Event('click');

    const chipHostSelector = 'ss-chip';
    const chipSelector = `[data-automation="chip-${textChipItem.id}"]`;
    const chipTextSelector = `[data-automation="chip-text-${textChipItem.id}"]`;
    const chipVisualContentSelector = `[data-automation="chip-visual-content-${textChipItem.id}"]`;
    const chipImageSelector = `[data-automation="chip-image-${imageChipItem.id}"]`;
    const chipIconSelector = `[data-automation="chip-icon-${iconChipItem.id}"]`;
    const chipCustomVisualContentSelector = `[data-automation="chip-custom-visual-content"]`;
    const chipRemoveButtonSelector = `[data-automation="chip-remove-${textChipItem.id}"]`;

    const getNativeElement = (selector: string) => fixture.debugElement.query(By.css(selector))?.nativeElement;

    const getElement = (selector: string): HTMLElement => el.querySelector(selector);

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        providers: [
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
        ],
        declarations: [
            BackgroundImageDirective,
            ChipComponent,
            ChipTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChipTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(chipHostSelector));
        el = de.nativeElement;
        comp = de.componentInstance;

        fixture.detectChanges();
    });

    it('should render chip', () => {
        testHostComp.item = textChipItem;

        fixture.detectChanges();

        expect(getNativeElement(chipSelector)).toBeTruthy();
    });

    it('should render chip with text', () => {
        testHostComp.item = textChipItem;

        fixture.detectChanges();

        expect(getNativeElement(chipTextSelector).textContent).toContain(textChipItem.text);
        expect(getNativeElement(chipTextSelector).title).toContain(textChipItem.text);
        expect(getNativeElement(chipVisualContentSelector)).toBeFalsy();
    });

    it('should render chip with image', () => {
        testHostComp.item = imageChipItem;

        fixture.detectChanges();

        expect(getNativeElement(chipImageSelector)).not.toBeNull();
    });

    it('should render chip with icon', () => {
        testHostComp.item = iconChipItem;

        fixture.detectChanges();

        expect(getNativeElement(chipIconSelector)).not.toBeNull();
    });

    it('should render chip with custom visual content', () => {
        const expectedBackgroundColor = 'rgb(17, 17, 17)';
        customVisualContentChipItem.customVisualContent.template = testHostComp.customVisualContentTemplate;
        testHostComp.item = customVisualContentChipItem;

        fixture.detectChanges();

        expect(getNativeElement(chipCustomVisualContentSelector)).not.toBeNull();
        expect(getComputedStyle(getElement(chipCustomVisualContentSelector)).backgroundColor).toBe(expectedBackgroundColor);
    });

    it('should trigger event remove', () => {
        spyOn(comp.remove, 'emit');

        testHostComp.item = textChipItem;

        fixture.detectChanges();

        getNativeElement(chipRemoveButtonSelector).dispatchEvent(clickEvent);

        expect(comp.remove.emit).toHaveBeenCalledWith(textChipItem);
    });
});
