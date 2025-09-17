import { Component, OnInit } from '@angular/core';
import { TestingTypeService } from '../services/testing-type.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../pipes/truncate.pipe';

@Component({
  selector: 'app-testing-types',
  templateUrl: './testing-types.component.html',
  styleUrls: ['./testing-types.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TruncatePipe]
})
export class TestingTypesComponent implements OnInit {
  testingTypes: any[] = [];

  newTestingType: any = {
    name: '',
    description: ''
  };

  showTestingTypePopup = false;
  isEditMode = false;
  editingTestingTypeId: number | null = null;
  submitted = false;
  successMessage = '';

  constructor(private testingTypeService: TestingTypeService) {}

  ngOnInit(): void {
    this.loadTestingTypes();
  }

  loadTestingTypes(): void {
    this.testingTypeService.getTestingTypes().subscribe({
      next: (data: any[]) => {
        this.testingTypes = data;
      },
      error: (err) => {
        console.error('Error fetching testing types:', err);
      }
    });
  }

  openAddTestingTypePopup(): void {
    this.isEditMode = false;
    this.newTestingType = {
      name: '',
      description: ''
    };
    this.submitted = false;
    this.showTestingTypePopup = true;
  }

  editTestingType(testingType: any): void {
    this.isEditMode = true;
    this.editingTestingTypeId = testingType.id;
    this.newTestingType = { ...testingType };
    this.submitted = false;
    this.showTestingTypePopup = true;
  }

  closeTestingTypePopup(): void {
    this.showTestingTypePopup = false;
    this.isEditMode = false;
    this.editingTestingTypeId = null;
    this.submitted = false;
  }

  saveTestingType(): void {
    this.submitted = true;

    if (this.hasErrors()) {
      return;
    }

    if (this.isEditMode && this.editingTestingTypeId) {
      this.testingTypeService.updateTestingType(this.editingTestingTypeId, this.newTestingType).subscribe({
        next: () => {
          this.loadTestingTypes();
          this.showSuccessMessage('Testing type updated successfully');
          this.closeTestingTypePopup();
        },
        error: (err) => {
          console.error('Error updating testing type:', err);
        }
      });
    } else {
      this.testingTypeService.addTestingType(this.newTestingType).subscribe({
        next: () => {
          this.loadTestingTypes();
          this.showSuccessMessage('Testing type added successfully');
          this.closeTestingTypePopup();
        },
        error: (err) => {
          console.error('Error adding testing type:', err);
        }
      });
    }
  }

  hasErrors(): boolean {
    return !this.newTestingType.name;
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}
