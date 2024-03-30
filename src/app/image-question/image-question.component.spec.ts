import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageQuestionComponent } from './image-question.component';

describe('ImageQuestionComponent', () => {
  let component: ImageQuestionComponent;
  let fixture: ComponentFixture<ImageQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageQuestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
