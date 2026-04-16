import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaListaComponent } from './nota-lista';

describe('NotaLista', () => {
  let component: NotaListaComponent;
  let fixture: ComponentFixture<NotaListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotaListaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotaListaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
