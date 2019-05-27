import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacaoPage } from './informacao.page';

describe('InformacaoPage', () => {
  let component: InformacaoPage;
  let fixture: ComponentFixture<InformacaoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformacaoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
