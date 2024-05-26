import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipTableComponent } from './relationship-table.component';

describe('RelationshipTableComponent', () => {
  let component: RelationshipTableComponent;
  let fixture: ComponentFixture<RelationshipTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationshipTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RelationshipTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
