import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaFiscalComponent } from './nota-fiscal';

describe('NotaFiscal', () => {
  let component: NotaFiscalComponent;
  let fixture: ComponentFixture<NotaFiscalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotaFiscalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotaFiscalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
