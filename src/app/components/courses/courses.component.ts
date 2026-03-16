import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoadmapService, CustomRoadmap } from '../../services/roadmap.service';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, RouterLink],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  myRoadmaps: CustomRoadmap[] = [];

  constructor(private roadmapService: RoadmapService) {}

  ngOnInit() {
    this.myRoadmaps = this.roadmapService.getAllRoadmaps();
  }
}
