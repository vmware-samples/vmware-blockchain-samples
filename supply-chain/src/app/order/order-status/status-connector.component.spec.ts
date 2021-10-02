/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { ClarityModule } from '@clr/angular';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusConnectorComponent } from './status-connector.component';

describe('StatusConnectorComponent', () => {
  let component: StatusConnectorComponent;
  let fixture: ComponentFixture<StatusConnectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ClarityModule ],
      declarations: [ StatusConnectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
