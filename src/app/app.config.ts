import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration, withEventReplay, withNoHttpTransferCache } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './transloco-loader';
import { environment } from '../environments/environment';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES } from './i18n/language-registry';
import { LanguageService } from './i18n/language.service';
import { FontService } from './i18n/font.service';
import { RespondIoService } from './services/respond-io.service';
import { acceptLanguageInterceptor } from './i18n/accept-language.interceptor';
import {
  LucideAngularModule,
  Heart, GraduationCap, Briefcase, Landmark, Users, User, Check,
  Star, ArrowRight, ArrowLeft, Play, Calendar, Clock, MapPin, Mail, Phone, MessageSquare,
  Send, Menu, X, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
  Instagram, Twitter, Facebook, Linkedin, Youtube,
  ShoppingBag, Search,
  Sparkles, Moon, Sun, Eye, Crown, Zap, Palette, Smartphone, Puzzle,
  Mars, Venus, FileX, MessageCircle,
  CheckCheck, HeartHandshake, Copy,
  CircleCheck, CircleX,
  QrCode, Bell, BarChart3, UserPlus, ScanLine, ShieldCheck, Gift, Quote, Building2, LayoutDashboard,
  Lightbulb, UserCheck
} from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withFetch(), withInterceptors([acceptLanguageInterceptor])),
    provideClientHydration(withEventReplay(), withNoHttpTransferCache()),
    provideAnimations(),
    provideTransloco({
      config: {
        availableLangs: [...SUPPORTED_LANGUAGE_CODES],
        defaultLang: DEFAULT_LANGUAGE.code,
        fallbackLang: DEFAULT_LANGUAGE.code,
        reRenderOnLangChange: true,
        prodMode: environment.production,
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => {
      inject(LanguageService);
      inject(FontService);
      inject(RespondIoService).loadWidget();
    }),
    importProvidersFrom(LucideAngularModule.pick({
      Heart, GraduationCap, Briefcase, Landmark, Users, User, Check,
      Star, ArrowRight, ArrowLeft, Play, Calendar, Clock, MapPin, Mail, Phone, MessageSquare,
      Send, Menu, X, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
      Instagram, Twitter, Facebook, Linkedin,
      ShoppingBag, Search,
      Sparkles, Moon, Sun, Eye, Crown, Zap, Palette, Smartphone, Puzzle,
      Mars, Venus, FileX, MessageCircle,
      CheckCheck, HeartHandshake, Copy,
      CircleCheck, CircleX,
      QrCode, Bell, BarChart3, UserPlus, ScanLine, ShieldCheck, Gift, Quote, Building2, LayoutDashboard,
      Lightbulb, UserCheck
    }))
  ]
};
