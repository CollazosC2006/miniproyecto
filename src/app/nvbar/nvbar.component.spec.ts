import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NvbarComponent } from './nvbar.component';

describe('NvbarComponent', () => {
  let component: NvbarComponent;
  let fixture: ComponentFixture<NvbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NvbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NvbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
