import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateItemFormComponent } from './create-item-form.component';

describe('CreateItemFormComponent', () => {
  let component: CreateItemFormComponent;
  let fixture: ComponentFixture<CreateItemFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateItemFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
