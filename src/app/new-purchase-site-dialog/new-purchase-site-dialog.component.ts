import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TiendasService } from '../services/tiendas.service';
import { Market } from '../interfaces/market';


@Component({
  selector: 'app-new-purchase-site-dialog',
  standalone: true,
  imports: [
    MatInputModule, 
    MatDialogActions,
    MatIconModule,
    MatDialogContent,
    NgFor,
    ReactiveFormsModule,
    MatButtonModule,
    MatOption,
   
    
  ],
  templateUrl: './new-purchase-site-dialog.component.html',
  styleUrl: './new-purchase-site-dialog.component.css'
})


export class NewPurchaseSiteDialogComponent {
  newSiteForm: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<NewPurchaseSiteDialogComponent>,
    private fb: FormBuilder
  ) {
    this.newSiteForm = this.fb.group({
      siteName: ['', Validators.required]
    });
  }

  

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.newSiteForm.valid) {
      this.dialogRef.close(this.newSiteForm.value.siteName);
    }
  }
}
