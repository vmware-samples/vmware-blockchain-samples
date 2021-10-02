import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountGenComponent } from './account-gen.component';

describe('AccountGenComponent', () => {
  let component: AccountGenComponent;
  let fixture: ComponentFixture<AccountGenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountGenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountGenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
