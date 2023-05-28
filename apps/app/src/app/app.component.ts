import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { SSOService } from './modules/sso/services/sso.service';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, combineLatest, filter, map, pipe, startWith, takeUntil, tap } from 'rxjs';

interface AppProps {
  ready?: boolean;
  keycloakInitError?: Error;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy {

    constructor(
      public readonly authService: SSOService,
      private readonly router: Router,
    ) {}

    private readonly $destroy: Subject<void> = new Subject();

    private $loading: Observable<boolean> = this.router.events.pipe(filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError), map((event) => {
      return event instanceof NavigationStart;
    }));

    public readonly $props: Observable<AppProps> = combineLatest([
      this.$loading.pipe(filter((isLoading) => !isLoading)),
      this.authService.$ready.pipe(filter((isReady) => isReady)),
      this.authService.$onInitError.pipe(startWith(null)),
    ]).pipe(
      map(([isRouteLoading, isReady, keycloakInitError]): AppProps => {

        // Toggle splash element
        const splashElement: HTMLElement = document.querySelector("#asc-splash-screen");
        if(!isRouteLoading && isReady) {
          splashElement.style.display = "none";
        } else {
          splashElement.style.display = "block";
        }

        return {
          ready: !isRouteLoading && isReady,
          keycloakInitError: keycloakInitError
        }
      }),
      takeUntil(this.$destroy)
    );

    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

}
