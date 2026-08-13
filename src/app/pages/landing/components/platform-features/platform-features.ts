import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule } from 'lucide-angular';

interface FeatureItem {
  icon: string;
  key: string;
}

@Component({
  selector: 'app-platform-features',
  standalone: true,
  imports: [TranslocoModule, LucideAngularModule],
  templateUrl: './platform-features.html',
  styleUrl: './platform-features.css'
})
export class PlatformFeaturesComponent {
  readonly inviteItems: FeatureItem[] = [
    { icon: 'send', key: 'platformFeatures.groupInvites.item0' },
    { icon: 'play', key: 'platformFeatures.groupInvites.item1' },
    { icon: 'message-circle', key: 'platformFeatures.groupInvites.item2' },
    { icon: 'bell', key: 'platformFeatures.groupInvites.item3' },
    { icon: 'user-plus', key: 'platformFeatures.groupInvites.item4' }
  ];

  readonly attendanceItems: FeatureItem[] = [
    { icon: 'bar-chart-3', key: 'platformFeatures.groupAttendance.item0' },
    { icon: 'qr-code', key: 'platformFeatures.groupAttendance.item1' },
    { icon: 'scan-line', key: 'platformFeatures.groupAttendance.item2' },
    { icon: 'message-square', key: 'platformFeatures.groupAttendance.item3' },
    { icon: 'shield-check', key: 'platformFeatures.groupAttendance.item4' },
    { icon: 'gift', key: 'platformFeatures.groupAttendance.item5' }
  ];
}
