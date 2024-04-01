import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TamilQuestionComponent } from './tamil-question.component';

describe('TamilQuestionComponent', () => {
  let component: TamilQuestionComponent;
  let fixture: ComponentFixture<TamilQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TamilQuestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TamilQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
