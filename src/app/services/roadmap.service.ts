import { Injectable } from '@angular/core';
import { Observable, from, of, delay, switchMap } from 'rxjs';
import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc, query, orderBy
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
  createdAt: string; // ISO string for Firestore
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {
  // Local cache for the current session
  private roadmapCache: Map<string, CustomRoadmap> = new Map();

  constructor(private authService: AuthService) {}

  /**
   * Generates a mock roadmap and saves it to Firestore under the user's collection.
   */
  generateRoadmap(prompt: string): Observable<CustomRoadmap> {
    const userId = this.authService.userId;
    if (!userId) {
      throw new Error('User must be logged in to generate a roadmap');
    }

    const roadmapId = 'rm_' + Math.random().toString(36).substr(2, 9);

    const newRoadmap: CustomRoadmap = {
      id: roadmapId,
      title: `${prompt.substring(0, 15).toUpperCase()} Zero-to-Hero`,
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
          title: 'Module 1: The Absolute Basics',
          topics: [
            { id: 't1_1', title: 'What actually is it?', isRead: false, timeSpentSeconds: 0, quizAttempted: false, quizScore: 0, fireLevel: null },
            { id: 't1_2', title: 'Why should you care?', isRead: false, timeSpentSeconds: 0, quizAttempted: false, quizScore: 0, fireLevel: null },
            { id: 't1_3', title: 'Setup & Installation', isRead: false, timeSpentSeconds: 0, quizAttempted: false, quizScore: 0, fireLevel: null },
          ]
        },
        {
          id: 'm2',
          title: 'Module 2: Core Concepts (Mains)',
          topics: [
            { id: 't2_1', title: 'The Architecture', isRead: false, timeSpentSeconds: 0, quizAttempted: false, quizScore: 0, fireLevel: null },
            { id: 't2_2', title: 'Key Algorithms & Logic', isRead: false, timeSpentSeconds: 0, quizAttempted: false, quizScore: 0, fireLevel: null },
            { id: 't2_3', title: 'Common Pitfalls', isRead: false, timeSpentSeconds: 0, quizAttempted: false, quizScore: 0, fireLevel: null },
          ]
        },
        {
          id: 'm3',
          title: 'Module 3: Advanced "Chad" Topics',
          topics: [
            { id: 't3_1', title: 'Performance Optimization', isRead: false, timeSpentSeconds: 0, quizAttempted: false, quizScore: 0, fireLevel: null },
            { id: 't3_2', title: 'Real-world Scaling', isRead: false, timeSpentSeconds: 0, quizAttempted: false, quizScore: 0, fireLevel: null },
          ]
        }
      ]
    };

    // Save to Firestore and cache
    return of(null).pipe(
      delay(2500), // Simulate LLM generation time
      switchMap(() => {
        const docRef = doc(db, 'users', userId, 'roadmaps', roadmapId);
        return from(setDoc(docRef, newRoadmap)).pipe(
          switchMap(() => {
            this.roadmapCache.set(roadmapId, newRoadmap);
            return of(newRoadmap);
          })
        );
      })
    );
  }

  /**
   * Fetches a single roadmap — tries cache first, then Firestore
   */
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

  /**
   * Fetches all roadmaps for the current user from Firestore.
   */
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
   * Simulates AI note generation (will later call LLM API)
   */
  fetchTopicNotes(topicId: string, promptInfo: string, language: 'English' | 'Hinglish'): Observable<string> {
    let content = '';
    if (language === 'Hinglish') {
      content = `**Bhai sun:** Tu jo sikhna chahta hai (*${promptInfo}*), yeh topic uska fundamental base hai! \n\nAsal life mein, jab hum complex problems face karte hain, we need clear architecture. \n\n*Pro Tip:* Isko skip mat karna varna practically kuch apply nahi kar paega.`;
    } else {
      content = `**Core Overview:** Understanding the core fundamentals of *${promptInfo}*.\n\nIn industry applications, mastering this foundational architectural piece separates Junior developers from Senior engineers.\n\n*Pro Tip:* Ensure you fully grasp this before advancing.`;
    }
    return of(content).pipe(delay(1000));
  }

  /**
   * Marks a topic as read and persists to Firestore
   */
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

  /**
   * Submits quiz result and persists to Firestore
   */
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

  /**
   * Helper to persist roadmap state to Firestore
   */
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
