import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenlistComponent } from './openlist.component';

describe('OpenlistComponent', () => {
  let component: OpenlistComponent;
  let fixture: ComponentFixture<OpenlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
