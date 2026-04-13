import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaFiscal } from './nota-fiscal';

describe('NotaFiscal', () => {
  let component: NotaFiscal;
  let fixture: ComponentFixture<NotaFiscal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotaFiscal],
    }).compileComponents();

    fixture = TestBed.createComponent(NotaFiscal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
