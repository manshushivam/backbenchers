import { Injectable } from '@angular/core';

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatarUrl: string;
  points: number;
  badges: string[];
  streak: number;
}

@Injectable({
  providedIn: 'root'
})
export class CourseDataService {

  constructor() { }

  getLeaderboard(): LeaderboardUser[] {
    return [
      { rank: 1, name: 'Rahul.dev', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul', points: 9500, badges: ['Ratta King 👑', 'Streak Master 🔥'], streak: 45 },
      { rank: 2, name: 'Priya_codes', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', points: 8200, badges: ['Concept Master 🧠'], streak: 12 },
      { rank: 3, name: 'Just_Passing', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit', points: 5100, badges: ['Last Bench Legend 🕶️'], streak: 3 },
      { rank: 4, name: 'sleepy_coder', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sleepy', points: 4000, badges: [], streak: 1 }
    ];
  }
}
