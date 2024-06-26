import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('LabeledConnectionComponent', () => {
  let component: LabeledConnectionComponent;
  let fixture: ComponentFixture<LabeledConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabeledConnectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabeledConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
