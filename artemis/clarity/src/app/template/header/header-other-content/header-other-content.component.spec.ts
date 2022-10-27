import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderOtherContentComponent } from './header-other-content.component';

describe('HeaderOtherContentComponent', () => {
  let component: HeaderOtherContentComponent;
  let fixture: ComponentFixture<HeaderOtherContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderOtherContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderOtherContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
