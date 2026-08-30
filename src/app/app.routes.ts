import { inject } from '@angular/core';
import { Params, Router, Routes, UrlTree } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing';
import { DesignsPageComponent } from './pages/designs/designs-page.component';
import { SupervisorsPageComponent } from './pages/supervisors/supervisors-page.component';
import { BlogPageComponent } from './pages/blog/blog-page.component';
import { BlogPostDetailComponent } from './pages/blog/blog-post-detail.component';
import { PackagesPageComponent } from './pages/packages/packages-page.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { CancellationPolicyComponent } from './pages/cancellation-policy/cancellation-policy.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { localeCanMatchGuard } from './i18n/locale.guard';
import { localeResolver } from './i18n/locale.resolver';
import { LanguageService } from './i18n/language.service';

/**
 * Builds a redirect UrlTree of the form `/{resolvedLang}/{...pathSegments}`,
 * preserving query params and fragment. Used by both the bare-root redirect
 * and the wildcard fallback below, so unprefixed URLs — whether that's `/`
 * itself or a pre-migration deep link like `/blog/15?page=2#comments` —
 * resolve to a locale-prefixed equivalent through one shared mechanism
 * rather than two separately-maintained ones.
 *
 * `redirectTo` functions run in an injection context, so `inject()` here is
 * valid per Angular's Router API.
 */
function buildLocaleRedirect(
  pathSegments: string[],
  queryParams: Params,
  fragment: string | null,
): UrlTree {
  const router = inject(Router);
  const languageService = inject(LanguageService);

  const lang = languageService.resolveRedirectLanguage();

  return router.createUrlTree([`/${lang}`, ...pathSegments], {
    queryParams,
    fragment: fragment ?? undefined,
  });
}

const localizedChildRoutes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'designs', component: DesignsPageComponent },
  { path: 'supervisors', component: SupervisorsPageComponent },
  { path: 'blog', component: BlogPageComponent },
  { path: 'blog/:id', component: BlogPostDetailComponent },
  { path: 'packages', component: PackagesPageComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'cancellation-policy', component: CancellationPolicyComponent },
  // Terminal catch-all for this locale subtree. Anything that reaches here
  // has a valid locale prefix but no matching page — render a localized 404
  // directly instead of falling through to the top-level wildcard below,
  // which would otherwise re-run buildLocaleRedirect and prepend another
  // locale segment indefinitely.
  { path: '**', component: NotFoundComponent },
];

export const routes: Routes = [
  // Bare root is a redirect target only — it is never itself a renderable
  // page. Resolves via LanguageService's URL > localStorage > cookie >
  // browser priority chain (URL doesn't apply here since there is none yet).
  {
    path: '',
    pathMatch: 'full',
    redirectTo: (data) => buildLocaleRedirect([], data.queryParams, data.fragment),
  },
  // The one and only locale-prefixed route subtree, generated from the
  // existing route list rather than hand-duplicated per language.
  // `canMatch` rejects any first segment that isn't a real supported
  // language code, letting the router fall through to the wildcard below
  // instead of mistakenly treating e.g. `/designs` as `:lang="designs"`.
  {
    path: ':lang',
    canMatch: [localeCanMatchGuard],
    resolve: { lang: localeResolver },
    children: localizedChildRoutes,
  },
  // Anything left unmatched — a pre-migration URL with no locale segment
  // (`/designs`, `/blog/15?page=2#comments`, ...) or a genuinely invalid
  // path — redirects to its locale-prefixed equivalent, preserving the
  // original path/query/fragment, so existing bookmarks and indexed URLs
  // aren't orphaned by the routing change. Static/asset requests never
  // reach here — server.ts short-circuits them before Angular's router
  // sees them — and unknown page paths terminate in the inner `:lang`
  // wildcard's 404 above rather than looping back through here.
  {
    path: '**',
    redirectTo: (data) =>
      buildLocaleRedirect(
        data.url.map((segment) => segment.path),
        data.queryParams,
        data.fragment,
      ),
  },
];
