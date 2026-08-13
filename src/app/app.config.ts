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
  Instagram, Twitter, Facebook, Linkedin,
  ShoppingBag, Search,
  Sparkles, Moon, Sun, Eye, Crown, Zap, Palette, Smartphone, Puzzle,
  Mars, Venus, FileX, MessageCircle,
  CheckCheck, HeartHandshake, Copy,
  CircleCheck, CircleX,
  QrCode, Bell, BarChart3, UserPlus, ScanLine, ShieldCheck, Gift, Quote, Building2,
} from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withFetch(), withInterceptors([acceptLanguageInterceptor])),
    provideClientHydration(withEventReplay(), withNoHttpTransferCache()),
    provideAnimations(),
    // Transloco config is now derived entirely from the Language Registry
    // (Phase 2) rather than a second, separately maintained literal list —
    // adding a language later means adding one registry entry, not touching
    // this config too.
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
    // Eagerly construct LanguageService/FontService at bootstrap so
    // FontService's reactive effect is already subscribed by the time the
    // locale route resolver sets the active language — belt-and-suspenders
    // against any ordering surprise, on both server and client.
    provideAppInitializer(() => {
      inject(LanguageService);
      inject(FontService);
      // No-ops on the server (RespondIoService guards on isPlatformBrowser);
      // injects the chat widget script once, on first browser bootstrap.
      inject(RespondIoService).loadWidget();
    }),
    importProvidersFrom(LucideAngularModule.pick({
      // existing
      Heart, GraduationCap, Briefcase, Landmark, Users, User, Check,
      Star, ArrowRight, ArrowLeft, Play, Calendar, Clock, MapPin, Mail, Phone, MessageSquare,
      Send, Menu, X, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
      Instagram, Twitter, Facebook, Linkedin,
      ShoppingBag, Search,
      Sparkles, Moon, Sun, Eye, Crown, Zap, Palette, Smartphone, Puzzle,
      Mars, Venus, FileX, MessageCircle,
      CheckCheck, HeartHandshake, Copy,
      CircleCheck, CircleX,
      QrCode, Bell, BarChart3, UserPlus, ScanLine, ShieldCheck, Gift, Quote, Building2,
    }))
  ]
};
