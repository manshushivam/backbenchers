import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoadmapService, CustomRoadmap } from '../../services/roadmap.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, RouterLink],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  myRoadmaps: CustomRoadmap[] = [];
  isLoading: boolean = true;

  constructor(
    private roadmapService: RoadmapService,
    public authService: AuthService
  ) {}

  async ngOnInit() {
    if (this.authService.isLoggedIn) {
      this.myRoadmaps = await this.roadmapService.getAllRoadmaps();
    }
    this.isLoading = false;
  }
}
