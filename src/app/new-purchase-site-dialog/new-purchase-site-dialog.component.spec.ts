import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPurchaseSiteDialogComponent } from './new-purchase-site-dialog.component';

describe('NewPurchaseSiteDialogComponent', () => {
  let component: NewPurchaseSiteDialogComponent;
  let fixture: ComponentFixture<NewPurchaseSiteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPurchaseSiteDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPurchaseSiteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
