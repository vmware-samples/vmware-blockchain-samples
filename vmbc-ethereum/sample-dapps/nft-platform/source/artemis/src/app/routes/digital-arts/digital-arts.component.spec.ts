import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalArtsComponent } from './digital-arts.component';

describe('DigitalArtsComponent', () => {
  let component: DigitalArtsComponent;
  let fixture: ComponentFixture<DigitalArtsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DigitalArtsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitalArtsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
