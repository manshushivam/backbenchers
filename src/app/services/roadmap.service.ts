import { Injectable } from '@angular/core';
import { Observable, from, of, delay, switchMap } from 'rxjs';
import {
  collection, doc, setDoc, getDoc, getDocs, query, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { AuthService } from './auth.service';

export interface DynamicTopic {
  id: string;
  title: string;
  isRead: boolean;
  timeSpentSeconds: number;
  quizAttempted: boolean;
  quizScore: number;
  fireLevel: 'Super Fire 🔥' | 'Small Flame 🔥' | 'Last Bench 📉' | null;
  aiNotesContent?: string;
}

export interface DynamicModule {
  id: string;
  title: string;
  topics: DynamicTopic[];
}

export interface CustomRoadmap {
  id: string;
  title: string;
  topicPrompt: string;
  status: 'In Progress' | 'Completed';
  overallProgress: number;
  totalStreak: number;
  totalPoints: number;
  modules: DynamicModule[];
  createdAt: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {
  private roadmapCache: Map<string, CustomRoadmap> = new Map();

  constructor(private authService: AuthService) {}

  /**
   * Placeholder for generating a roadmap.
   * This will be connected to your Node.js backend soon!
   */
  generateRoadmap(prompt: string): Observable<CustomRoadmap> {
    const userId = this.authService.userId;
    if (!userId) {
      throw new Error('User must be logged in to generate a roadmap');
    }

    const roadmapId = 'rm_' + Math.random().toString(36).substr(2, 9);
    
    // TEMPORARY: Reverting to mock until Node.js backend is ready
    return of({
      id: roadmapId,
      title: `${prompt.toUpperCase()} Zero-to-Hero`,
      topicPrompt: prompt,
      status: 'In Progress',
      overallProgress: 0,
      totalStreak: 0,
      totalPoints: 0,
      createdAt: new Date().toISOString(),
      userId: userId,
      modules: [
        {
          id: 'm1',
          title: 'Module 1: Getting Started',
          topics: [
            { id: 't1_1', title: `Intro to ${prompt}`, isRead: false, timeSpentSeconds: 0, quizAttempted: false, quizScore: 0, fireLevel: null },
            { id: 't1_2', title: 'Core Concepts', isRead: false, timeSpentSeconds: 0, quizAttempted: false, quizScore: 0, fireLevel: null }
          ]
        },
        {
          id: 'm2',
          title: 'Module 2: Advanced Topics',
          topics: [
            { id: 't2_1', title: 'Practical Application', isRead: false, timeSpentSeconds: 0, quizAttempted: false, quizScore: 0, fireLevel: null }
          ]
        }
      ]
    } as CustomRoadmap).pipe(
      delay(2000), // Simulate LLM processing
      switchMap(roadmap => {
        const docRef = doc(db, 'users', userId, 'roadmaps', roadmapId);
        return from(setDoc(docRef, roadmap)).pipe(
          switchMap(() => {
            this.roadmapCache.set(roadmapId, roadmap);
            return of(roadmap);
          })
        );
      })
    );
  }

  async getRoadmap(id: string): Promise<CustomRoadmap | undefined> {
    if (this.roadmapCache.has(id)) {
      return this.roadmapCache.get(id);
    }

    const userId = this.authService.userId;
    if (!userId) return undefined;

    try {
      const docRef = doc(db, 'users', userId, 'roadmaps', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const roadmap = docSnap.data() as CustomRoadmap;
        this.roadmapCache.set(id, roadmap);
        return roadmap;
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    }
    return undefined;
  }

  async getAllRoadmaps(): Promise<CustomRoadmap[]> {
    const userId = this.authService.userId;
    if (!userId) return [];

    try {
      const roadmapsRef = collection(db, 'users', userId, 'roadmaps');
      const q = query(roadmapsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const roadmaps: CustomRoadmap[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as CustomRoadmap;
        this.roadmapCache.set(data.id, data);
        roadmaps.push(data);
      });
      return roadmaps;
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      return [];
    }
  }

  /**
   * Placeholder for fetching topic notes.
   * This will be connected to your Node.js backend soon!
   */
  fetchTopicNotes(topicId: string, roadmapTitle: string, topicTitle: string, language: 'English' | 'Hinglish'): Observable<string> {
    return of(`**Real AI Notes for ${topicTitle} Coming Soon!**\n\nTransitioning to a dedicated Node.js backend for faster and more reliable content generation.`).pipe(
      delay(1500)
    );
  }

  async updateTopicAsRead(roadmapId: string, topicId: string): Promise<void> {
    const roadmap = this.roadmapCache.get(roadmapId);
    if (!roadmap) return;

    roadmap.modules.forEach(m => {
      const topic = m.topics.find(t => t.id === topicId);
      if (topic && !topic.isRead) {
        topic.isRead = true;
        roadmap.totalPoints += 50;
      }
    });

    await this.saveRoadmapToFirestore(roadmap);
  }

  async submitQuizResult(roadmapId: string, topicId: string, score: number): Promise<void> {
    const roadmap = this.roadmapCache.get(roadmapId);
    if (!roadmap) return;

    roadmap.modules.forEach(m => {
      const topic = m.topics.find(t => t.id === topicId);
      if (topic) {
        topic.quizAttempted = true;
        topic.quizScore = score;
        if (score === 5) {
          topic.fireLevel = 'Super Fire 🔥';
          roadmap.totalStreak += 2;
          roadmap.totalPoints += 150;
        } else if (score >= 3) {
          topic.fireLevel = 'Small Flame 🔥';
          roadmap.totalStreak += 1;
          roadmap.totalPoints += 50;
        } else {
          topic.fireLevel = 'Last Bench 📉';
        }
      }
    });

    await this.saveRoadmapToFirestore(roadmap);
  }

  private async saveRoadmapToFirestore(roadmap: CustomRoadmap): Promise<void> {
    const userId = this.authService.userId;
    if (!userId) return;

    try {
      const docRef = doc(db, 'users', userId, 'roadmaps', roadmap.id);
      await setDoc(docRef, roadmap);
    } catch (error) {
      console.error('Error saving roadmap to Firestore:', error);
    }
  }
}
