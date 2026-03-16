import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CoursesComponent } from './components/courses/courses.component';
import { ExploreComponent } from './components/explore/explore.component';
import { NotesComponent } from './components/notes/notes.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Backbenchers | Home' },
  { path: 'courses', component: CoursesComponent, title: 'Backbenchers | Courses' },
  { path: 'explore', component: ExploreComponent, title: 'Backbenchers | Explore' },
  { path: 'leaderboard', component: LeaderboardComponent, title: 'Backbenchers | Leaderboard' },
  {
    path: 'roadmap/:roadmapId',
    component: NotesComponent,
    title: 'Backbenchers | Personalized Roadmap'
  },
  { path: '**', redirectTo: '' }
];
