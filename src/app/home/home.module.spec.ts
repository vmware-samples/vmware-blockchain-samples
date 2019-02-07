/*
 * Copyright 2019 VMware, all rights reserved.
 */

import { HomeModule } from './home.module';

describe('HomeModule', () => {
    let homeModule: HomeModule;

    beforeEach(() => {
        homeModule = new HomeModule();
    });

    it('should create an instance', () => {
        expect(homeModule).toBeTruthy();
    });
});
