/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ToggleRadioGroupComponent } from './toggle-radio-group.component';

describe('ToggleRadioGroupComponent', () => {
  let component: ToggleRadioGroupComponent;
  let fixture: ComponentFixture<ToggleRadioGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleRadioGroupComponent ],
      imports: [
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

  describe('Evaluate Uncheck', () => {
    let button;

    beforeEach(() => {
      button = fixture.debugElement.query(By.css('input'));
      button.nativeElement.click();
    });

    it('should select a value when selected', () => {
      expect(component.selectedValue).toBe(component.values[0]);
    });

    it('should deselect the value when selected again', () => {
      button.nativeElement.click();
      expect(component.selectedValue).toBe(null);
    });

    it('should change selections when another button is clicked', () => {
      const button2 = fixture.debugElement.queryAll(By.css('input'))[1];
      button2.nativeElement.click();
      expect(component.selectedValue).toBe(component.values[1]);
    });

  });
});
