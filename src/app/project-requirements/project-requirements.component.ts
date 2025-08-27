import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RequirementService } from '../services/requirement.service';
import { ProjectService } from '../services/project.service';
import { CommonModule } from '@angular/common';   // ✅ Needed for date pipe
import { FormsModule } from '@angular/forms';     // ✅ Needed for ngModel

@Component({
  selector: 'app-project-requirements',
  templateUrl: './project-requirements.component.html',
  styleUrls: ['./project-requirements.component.css'],
  standalone: true,  // ✅ Standalone component
  imports: [CommonModule, FormsModule]  // ✅ Import date + ngModel support
})
export class ProjectRequirementsComponent implements OnInit {
  projectId: number = 0;
  project: any = null;
  requirements: any[] = [];
  
  newRequirement: any = {
    requirement_title: '',
    requirement: '',
    priority: 'Medium',
    reported_date: '',
    expected_delivery: null,
    is_developed: false,
    is_tested: false,
    is_delivered: false
  };

  showRequirementPopup = false;
  isEditMode = false;
  editingRequirementId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requirementService: RequirementService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.loadProject();
    this.loadRequirements();
  }

  loadProject(): void {
    this.projectService.getProject(this.projectId).subscribe({
      next: (data: any) => {
        this.project = data;
      },
      error: (err) => {
        console.error('Error fetching project:', err);
      }
    });
  }

  loadRequirements(): void {
    this.requirementService.getRequirementsByProject(this.projectId).subscribe({
      next: (data: any[]) => {
        this.requirements = data;
      },
      error: (err) => {
        console.error('Error fetching requirements:', err);
      }
    });
  }

  getRequirementStatus(requirement: any): string {
    if (requirement.is_delivered) return 'delivered';
    if (requirement.is_tested) return 'tested';
    if (requirement.is_developed) return 'developed';
    return 'pending';
  }

  openAddRequirementPopup(): void {
    this.isEditMode = false;
    this.newRequirement = {
      requirement_title: '',
      requirement: '',
      priority: 'Medium',
      reported_date: new Date().toISOString().split('T')[0],
      expected_delivery: null,
      is_developed: false,
      is_tested: false,
      is_delivered: false,
      project: this.projectId
    };
    this.showRequirementPopup = true;
  }

  editRequirement(requirement: any): void {
    this.isEditMode = true;
    this.editingRequirementId = requirement.id;
    this.newRequirement = { ...requirement };
    this.showRequirementPopup = true;
  }

  closeRequirementPopup(): void {
    this.showRequirementPopup = false;
    this.isEditMode = false;
    this.editingRequirementId = null;
  }

  saveRequirement(): void {
    if (!this.newRequirement.requirement_title || !this.newRequirement.requirement || !this.newRequirement.reported_date) {
      alert('Please fill all required fields');
      return;
    }

    // Ensure project ID is set
    this.newRequirement.project = this.projectId;

    if (this.isEditMode && this.editingRequirementId) {
      this.requirementService.updateRequirement(this.editingRequirementId, this.newRequirement).subscribe({
        next: () => {
          this.loadRequirements();
          this.closeRequirementPopup();
        },
        error: (err) => {
          console.error('Error updating requirement:', err);
        }
      });
    } else {
      this.requirementService.addRequirement(this.newRequirement).subscribe({
        next: () => {
          this.loadRequirements();
          this.closeRequirementPopup();
        },
        error: (err) => {
          console.error('Error adding requirement:', err);
        }
      });
    }
  }

  viewTestCases(requirement: any): void {
    this.router.navigate(['/test-cases', requirement.id]);
  }
}