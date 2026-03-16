import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User | null = null;
  isLoading: boolean = true;

  constructor(private router: Router, private ngZone: NgZone) {
    onAuthStateChanged(auth, (user) => {
      this.ngZone.run(() => {
        this.currentUser = user;
        this.isLoading = false;
      });
    });
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      this.currentUser = result.user;
      this.router.navigate(['/explore']);
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  }

  async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  get isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  get userDisplayName(): string {
    return this.currentUser?.displayName || 'Backbencher';
  }

  get userPhotoURL(): string {
    return this.currentUser?.photoURL || '';
  }

  get userId(): string {
    return this.currentUser?.uid || '';
  }
}
