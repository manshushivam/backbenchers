import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import { RoadmapService, CustomRoadmap, DynamicTopic } from '../../services/roadmap.service';

@Component({
  selector: 'app-notes',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css'
})
export class NotesComponent implements OnInit {
  roadmapId: string = '';
  roadmap: CustomRoadmap | null = null;
  activeTopic: DynamicTopic | null = null;
  
  language: 'English' | 'Hinglish' = 'Hinglish';
  isGeneratingAI: boolean = false;
  doubtQuery: string = '';
  doubtResponse: string = '';

  get parsedAiNotes(): string {
    if (!this.activeTopic?.aiNotesContent) return '';
    return marked.parse(this.activeTopic.aiNotesContent) as string;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roadmapService: RoadmapService
  ) {}

  async ngOnInit() {
    this.roadmapId = this.route.snapshot.paramMap.get('roadmapId') || '';
    const loadedRoadmap = await this.roadmapService.getRoadmap(this.roadmapId);
    
    if (loadedRoadmap) {
      this.roadmap = loadedRoadmap;
      if (this.roadmap.modules.length > 0 && this.roadmap.modules[0].topics.length > 0) {
        this.selectTopic(this.roadmap.modules[0].topics[0]);
      }
    }
  }

  selectTopic(topic: DynamicTopic) {
    this.activeTopic = topic;
    this.doubtResponse = ''; // clear doubts on new topic
    
    if (!this.activeTopic.aiNotesContent) {
      this.generateNotesForTopic();
    }
  }

  toggleLanguage(lang: 'English' | 'Hinglish') {
    if (this.language !== lang) {
      this.language = lang;
      this.generateNotesForTopic();
    }
  }

  generateNotesForTopic() {
    if (!this.activeTopic || !this.roadmap) return;
    
    this.isGeneratingAI = true;
    
    this.roadmapService.fetchTopicNotes(
      this.activeTopic.id,
      this.roadmap.topicPrompt,
      this.activeTopic.title,
      this.language
    ).subscribe({
      next: (content) => {
        if (this.activeTopic) {
          this.activeTopic.aiNotesContent = content;
        }
        this.isGeneratingAI = false;
      },
      error: (err) => {
        console.error('AI Notes Error:', err);
        if (this.activeTopic) {
          this.activeTopic.aiNotesContent = '**Error generating notes.** Please try again later.';
        }
        this.isGeneratingAI = false;
      }
    });
  }

  async markCompleted() {
    if (this.activeTopic && this.roadmap) {
      await this.roadmapService.updateTopicAsRead(this.roadmap.id, this.activeTopic.id);
      
      this.activeTopic.timeSpentSeconds = 650; 
      alert("Bro, concept clear hai ya bas swipe kar rahe ho? 🤨 Take the 5-question challenge to unlock your streak!");
    }
  }

  async simulateQuizCompletion(score: number) {
    if (this.activeTopic && this.roadmap && !this.activeTopic.quizAttempted) {
      await this.roadmapService.submitQuizResult(this.roadmap.id, this.activeTopic.id, score);
      
      let message = "";
      if (score === 5) message = "Super Fire! 🔥 +2 Streak added.";
      else if (score >= 3) message = "Small Flame! 🔥 +1 Streak.";
      else message = "Last Bench! 📉 No streak gained.";
      alert(`Quiz completed. Score: ${score}/5. ${message}`);
    }
  }

  askDoubt(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    if (!this.doubtQuery.trim()) return;

    this.doubtResponse = "AI is thinking...";
    const query = this.doubtQuery;
    
    setTimeout(() => {
      this.doubtResponse = `Yo bro, for your doubt regarding "${query}": Keep grinding! Since it's a personalized roadmap, focus on the core concepts here first.`;
      this.doubtQuery = '';
    }, 1500);
  }
}
