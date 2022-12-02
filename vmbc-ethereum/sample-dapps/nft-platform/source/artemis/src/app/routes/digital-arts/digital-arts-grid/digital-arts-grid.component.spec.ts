import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalArtsGridComponent } from './digital-arts-grid.component';

describe('DigitalArtsGridComponent', () => {
  let component: DigitalArtsGridComponent;
  let fixture: ComponentFixture<DigitalArtsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DigitalArtsGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitalArtsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
