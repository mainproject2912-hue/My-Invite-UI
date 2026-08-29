import { Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { BlogPost } from '../../../../models/content.interface';
import { LanguageService } from '../../../../i18n/language.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslocoModule],
  templateUrl: './blog.html',
  styleUrl: './blog.css'
})
export class BlogComponent {
  blogPosts = input<BlogPost[]>([]);
  private languageService = inject(LanguageService);

  readonly displayedPosts = computed(() => (this.blogPosts() || []).slice(0, 3));
  readMoreIcon = computed(() => this.languageService.activeLanguage().direction === 'rtl' ? 'arrow-left' : 'arrow-right');

  constructor(private router: Router) {}

  navigateToBlog() {
    this.router.navigate(['/', this.languageService.activeLanguage().code, 'blog']);
  }

  navigateToPost(postId: string) {
    this.router.navigate(['/', this.languageService.activeLanguage().code, 'blog', postId]);
  }
}
