import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDataService, LeaderboardUser } from '../../services/course-data.service';

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {
  users: LeaderboardUser[] = [];

  constructor(private courseData: CourseDataService) {}

  ngOnInit() {
    this.users = this.courseData.getLeaderboard();
  }
}
