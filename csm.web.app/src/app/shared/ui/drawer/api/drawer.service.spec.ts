/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Injector,
    ViewContainerRef,
} from '@angular/core';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {ViewContainerRefStub} from '../../../../../test/stubs/view-container-ref.stub';
import {
    DRAWER_DATA,
    DrawerService
} from './drawer.service';

describe('Drawer Service', () => {
    let drawerService: DrawerService;
    let viewContainerRef: ViewContainerRef;

    let fakeComponentRef: any;

    const injector = Injector.create({
        providers: [],
    });

    const moduleDef: TestModuleMetadata = {
        providers: [
            DrawerService,
            {
                provide: Injector,
                useValue: injector,
            },
        ],
    };

    const componentToInject = DrawerService;
    const data = {attr: 'value'};

    const fakeInjector = Injector.create({
        providers: [],
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        drawerService = TestBed.inject(DrawerService);

        fakeComponentRef = {
            instance: {},
            hostView: 'hostView',
        };

        viewContainerRef = new ViewContainerRefStub(fakeInjector, fakeComponentRef);
        drawerService.setViewContainerRef(viewContainerRef);

    });

    it('should insert the component in the DOM', () => {
        spyOn(viewContainerRef, 'insert').and.callThrough();

        drawerService.open(componentToInject);

        expect(viewContainerRef.insert).toHaveBeenCalledWith(fakeComponentRef.hostView);
    });

    it('should emit afterClosed event on close', () => {
        const drawerRef = drawerService.open(componentToInject);
        let callbackCalled = false;

        drawerRef.afterClosed().subscribe(() => callbackCalled = true);

        drawerService.close();

        expect(callbackCalled).toBeTruthy();
    });

    it('should remove component from view container', () => {
        spyOn(viewContainerRef, 'remove').and.callThrough();

        drawerService.close();

        expect(viewContainerRef.remove).toHaveBeenCalled();
    });

    it('should pass the data to the component injected', () => {
        spyOn(viewContainerRef, 'createComponent').and.callThrough();
        drawerService.open(componentToInject, data);

        const expectedInjector = Injector.create({
            parent: fakeInjector,
            providers: [
                {
                    provide: DRAWER_DATA,
                    useValue: data,
                },
            ],
        });

        expect(viewContainerRef.createComponent).toHaveBeenCalledWith(componentToInject, {injector: expectedInjector});
    });

    it('should pass the default injector when view do not have one', () => {
        spyOn(viewContainerRef, 'createComponent').and.callThrough();

        viewContainerRef.createComponent(ViewContainerRefStub);
        drawerService.setViewContainerRef(viewContainerRef);
        drawerService.open(componentToInject, data);

        const expectedInjector = Injector.create({
            parent: injector,
            providers: [
                {
                    provide: DRAWER_DATA,
                    useValue: data,
                },
            ],
        });

        expect(viewContainerRef.createComponent).toHaveBeenCalledWith(componentToInject, {injector: expectedInjector});
    });
});
