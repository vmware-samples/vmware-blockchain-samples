/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SimpleConfirmationComponent } from '../simple-confirmation/simple-confirmation.component';
import { ToggleRadioGroupComponent } from './toggle-radio-group.component';

describe('ToggleRadioGroupComponent', () => {
  let component: ToggleRadioGroupComponent;
  let fixture: ComponentFixture<ToggleRadioGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SimpleConfirmationComponent,
        ToggleRadioGroupComponent
      ],
      imports: [
        ClarityModule,
        FormsModule,
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleRadioGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not have a default', () => {
    expect(component.selectedValue).toBe(undefined);
  });

  describe('evaluateUncheck()', () => {

    beforeEach(() => {
      component.evaluateUncheck(component.values[0]);
    });

    it('should select a value when selected', () => {
      expect(component.selectedValue).toBe(component.values[0]);
    });

    it('should deselect the value when selected again', () => {
      component.evaluateUncheck(component.values[0]);
      expect(component.selectedValue).toBe(null);
    });

    it('should change selections when another button is selected', () => {
      component.evaluateUncheck(component.values[1]);
      expect(component.selectedValue).toBe(component.values[1]);
    });

    it('should deselect the value when reset', () => {
      component.reset();
      expect(component.selectedValue).toBe(null);
    });

  });
});
