import { Component, OnInit } from '@angular/core';
import { TestingTypeService } from '../services/testing-type.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../pipes/truncate.pipe'; // ✅ Add this import


@Component({
  selector: 'app-testing-types',
  templateUrl: './testing-types.component.html',
  styleUrls: ['./testing-types.component.css'],
  standalone: true, // ✅ Make it standalone
  imports: [CommonModule, FormsModule, TruncatePipe] // ✅ Add TruncatePipe to imports
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
    this.showTestingTypePopup = true;
  }

  editTestingType(testingType: any): void {
    this.isEditMode = true;
    this.editingTestingTypeId = testingType.id;
    this.newTestingType = { ...testingType };
    this.showTestingTypePopup = true;
  }

  closeTestingTypePopup(): void {
    this.showTestingTypePopup = false;
    this.isEditMode = false;
    this.editingTestingTypeId = null;
  }

  saveTestingType(): void {
    if (!this.newTestingType.name) {
      alert('Please fill all required fields');
      return;
    }

    if (this.isEditMode && this.editingTestingTypeId) {
      this.testingTypeService.updateTestingType(this.editingTestingTypeId, this.newTestingType).subscribe({
        next: () => {
          this.loadTestingTypes();
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
          this.closeTestingTypePopup();
        },
        error: (err) => {
          console.error('Error adding testing type:', err);
        }
      });
    }
  }
}