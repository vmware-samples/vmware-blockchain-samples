import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EthService } from './eth/eth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    const ethServiceStub = () => ({ setAutoRefreshInterval: (interval) => ({}) });
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [AppComponent],
      providers: [{ provide: EthService, useFactory: ethServiceStub }]
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  it(`title has default value`, () => {
    expect(component.title).toEqual(`explorer`);
  });

  describe('ngOnInit', () => {
    it('makes expected calls', () => {
      component.ngOnInit();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#title').textContent).toContain('VMWare Ethereum Explorer');
    });
  });

  describe('changeAutoRefreshInterval', () => {
    it('should change interval to 1', () => {
      const ethServiceStub: EthService = fixture.debugElement.injector.get(
        EthService
      );
      const spy = spyOn(ethServiceStub, 'setAutoRefreshInterval').and.callThrough();
      component.changeAutoRefreshInterval(1);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(1);
      expect(element.querySelector('#refreshLbl').textContent).toContain('IN 1 SECOND')
    });

    it('should change interval to 5', () => {
      const ethServiceStub: EthService = fixture.debugElement.injector.get(
        EthService
      );
      const spy = spyOn(ethServiceStub, 'setAutoRefreshInterval').and.callThrough();
      component.changeAutoRefreshInterval(5);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(5);
      expect(element.querySelector('#refreshLbl').textContent).toContain('IN 5 SECONDS')
    });

    it('should change interval to 0', () => {
      const ethServiceStub: EthService = fixture.debugElement.injector.get(
        EthService
      );
      const spy = spyOn(ethServiceStub, 'setAutoRefreshInterval').and.callThrough();
      component.changeAutoRefreshInterval(0);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(0);
      expect(element.querySelector('#refreshLbl').textContent).toContain('DISABLED')
    });
  });
});
