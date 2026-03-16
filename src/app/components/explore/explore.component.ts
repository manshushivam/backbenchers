import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoadmapService } from '../../services/roadmap.service';

@Component({
  selector: 'app-explore',
  imports: [CommonModule, FormsModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent {
  searchQuery: string = '';
  isGenerating: boolean = false;

  constructor(
    private roadmapService: RoadmapService,
    private router: Router
  ) {}

  generateRoadmap() {
    if (!this.searchQuery.trim() || this.isGenerating) return;

    this.isGenerating = true;

    // Simulate backend LLM generation
    this.roadmapService.generateRoadmap(this.searchQuery).subscribe({
      next: (roadmap) => {
        this.isGenerating = false;
        // Redirect to the new personalized tracking view
        this.router.navigate(['/roadmap', roadmap.id]);
      },
      error: () => {
        this.isGenerating = false;
        alert("Failed to generate roadmap. Please try again.");
      }
    });
  }
}
