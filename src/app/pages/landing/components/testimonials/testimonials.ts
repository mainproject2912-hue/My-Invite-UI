import { Component, inject, computed } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ContentService } from '../../../../services/content.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css'
})
export class TestimonialsComponent {
  private readonly contentService = inject(ContentService);
  
  readonly defaultTestimonials = [
    {
      id: '1',
      name: 'سارة الشهري',
      role: 'الدمام',
      content: 'خدمة الفخامة والترتيب جداً رائعة! شكراً من القلب.',
      rating: 5
    },
    {
      id: '2',
      name: 'نورة المطيري',
      role: 'جدة',
      content: 'سرعة في التنفيذ ودقة في التفاصيل، أصبح كل ضيوفي متفاعلين معهم.',
      rating: 5
    },
    {
      id: '3',
      name: 'أمل العتيبي',
      role: 'الرياض',
      content: 'التصميم كان أكثر من رائع والظهور بالباركود ريّحنا جداً عند القاعة.',
      rating: 5
    }
  ];

  readonly testimonials = computed(() => {
    const list = this.contentService.testimonials();
    return list && list.length > 0 ? list : this.defaultTestimonials;
  });

  readonly stars = [0, 1, 2, 3, 4];
}
