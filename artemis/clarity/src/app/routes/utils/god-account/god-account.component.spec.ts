import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GodAccountComponent } from './god-account.component';

describe('GodAccountComponent', () => {
  let component: GodAccountComponent;
  let fixture: ComponentFixture<GodAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GodAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GodAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
