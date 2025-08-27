import { Component, OnInit } from '@angular/core';
import { TechnologyService } from '../services/technology.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../pipes/truncate.pipe';

@Component({
  selector: 'app-technologies',
  templateUrl: './technologies.component.html',
  styleUrls: ['./technologies.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TruncatePipe]
})
export class TechnologiesComponent implements OnInit {
  technologies: any[] = [];
  
  newTechnology: any = {
    name: '',
    type_name: 'Frontend',
    description: ''
  };

  showTechnologyPopup = false;
  isEditMode = false;
  editingTechnologyId: number | null = null;
  submitted = false;

  constructor(private technologyService: TechnologyService) {}

  ngOnInit(): void {
    this.loadTechnologies();
  }

  loadTechnologies(): void {
    this.technologyService.getTechnologies().subscribe({
      next: (data: any[]) => {
        this.technologies = data;
      },
      error: (err) => {
        console.error('Error fetching technologies:', err);
      }
    });
  }

  openAddTechnologyPopup(): void {
    this.isEditMode = false;
    this.newTechnology = {
      name: '',
      type_name: 'Frontend',
      description: ''
    };
    this.submitted = false;
    this.showTechnologyPopup = true;
  }

  editTechnology(technology: any): void {
    this.isEditMode = true;
    this.editingTechnologyId = technology.id;
    this.newTechnology = { ...technology };
    this.submitted = false;
    this.showTechnologyPopup = true;
  }

  closeTechnologyPopup(): void {
    this.showTechnologyPopup = false;
    this.isEditMode = false;
    this.editingTechnologyId = null;
    this.submitted = false;
  }

  saveTechnology(): void {
    this.submitted = true;

    if (this.hasErrors()) {
      return;
    }

    if (this.isEditMode && this.editingTechnologyId) {
      this.technologyService.updateTechnology(this.editingTechnologyId, this.newTechnology).subscribe({
        next: () => {
          this.loadTechnologies();
          this.closeTechnologyPopup();
        },
        error: (err) => {
          console.error('Error updating technology:', err);
        }
      });
    } else {
      this.technologyService.addTechnology(this.newTechnology).subscribe({
        next: () => {
          this.loadTechnologies();
          this.closeTechnologyPopup();
        },
        error: (err) => {
          console.error('Error adding technology:', err);
        }
      });
    }
  }

  // ✅ Validate form fields
  hasErrors(): boolean {
    return (
      !this.newTechnology.name ||
      !this.newTechnology.type_name
    );
  }
}
