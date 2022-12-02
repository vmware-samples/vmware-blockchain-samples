import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalArtsDetailsComponent } from './digital-arts-details.component';

describe('DigitalArtsDetailsComponent', () => {
  let component: DigitalArtsDetailsComponent;
  let fixture: ComponentFixture<DigitalArtsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DigitalArtsDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitalArtsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
