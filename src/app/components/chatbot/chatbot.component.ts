import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChatMessage {
  text: string;
  sender: 'ai' | 'user';
}

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  isOpen = false;
  messages: ChatMessage[] = [
    { text: "Yo bro! Didn't understand the notes? Ask me anything.", sender: 'ai' }
  ];

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  askQuestion(question: string) {
    this.messages.push({ text: question, sender: 'user' });
    
    // Simulate AI thinking
    setTimeout(() => {
      this.messages.push({ 
        text: `Bro, think of it like this: ${question} is just like when you're trying to sneak into the class late and the teacher is the OS scheduling other processes. You gotta wait your turn in the ready queue! 😂`, 
        sender: 'ai' 
      });
    }, 1000);
  }
}
