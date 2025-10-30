import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Params, Router, RouterOutlet } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { SessionMonitorService, TokenExpiryInfo } from '../../../core/services/session-monitor.service';
import { SidebarService } from '../services/sidebar.service';
import { SidebarComponent } from '../sidebar/sidebar';
import { ConfirmDialogComponent, DialogData } from '../../../shared/components/notification-dialog/confirm-dialog.component';

interface RefreshTokenResponse {
  message: string;
  token?: string;
  expires_in?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @HostBinding('class.sidebar-expanded') sidebarExpanded = true;
  @HostBinding('class.sidebar-collapsed') sidebarCollapsed = false;

  private destroy$ = new Subject<void>();
  private warningDialogRef?: MatDialogRef<ConfirmDialogComponent, boolean>;
  private warningDialogData: DialogData | null = null;
  private countdownTimerId: ReturnType<typeof setInterval> | null = null;
  private ignoreDialogClose = false;
  private remainingSeconds = 0;

  private readonly defaultRedirect = '/dashboard';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly sidebarService: SidebarService,
    private readonly sessionMonitor: SessionMonitorService,
    private readonly dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.observeSidebarState();
    this.observeGoogleCallback();
    this.observeRouterNavigation();
    this.observeSessionWarnings();

    if (this.authService.isLoggedIn()) {
      this.restartSessionMonitoring();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.clearCountdown();
    this.closeWarningDialog();
    this.sessionMonitor.stopMonitoring();
  }

  private observeSidebarState(): void {
    this.sidebarService.isExpanded$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isExpanded => {
        this.sidebarExpanded = isExpanded;
        this.sidebarCollapsed = !isExpanded;
      });
  }

  private observeGoogleCallback(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => this.handleGoogleQueryParams(params));
  }

  private observeRouterNavigation(): void {
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(() => this.ensureDashboardChildRoute());
  }

  private observeSessionWarnings(): void {
    this.sessionMonitor.getSessionWarnings()
      .pipe(takeUntil(this.destroy$))
      .subscribe((info: TokenExpiryInfo) => this.handleSessionWarning(info));
  }

  private handleGoogleQueryParams(params: Params): void {
    if (params['token']) {
      const token = params['token'] as string;
      const user = {
        id: Number.parseInt(params['user_id'] ?? '0', 10),
        type: params['user_type'] ?? '',
        name: params['user_name'] ?? '',
        email: params['user_email'] ?? ''
      };

      this.authService.handleGoogleCallback(token, user);
      this.restartSessionMonitoring();

      const redirectUrl = this.authService.getDashboardRoute();
      this.router.navigate([redirectUrl], { replaceUrl: true });
      return;
    }

    if (params['error']) {
      this.router.navigate(['/auth/login']);
    }
  }

  private ensureDashboardChildRoute(): void {
    const currentUrl = this.router.url.split('?')[0];
    if (currentUrl !== '/dashboard' && currentUrl !== '/dashboard/') {
      return;
    }

    const redirectUrl = this.authService.getDashboardRoute();
    if (!redirectUrl || redirectUrl === this.defaultRedirect) {
      return;
    }

    this.router.navigate([redirectUrl], { replaceUrl: true });
  }

  private handleSessionWarning(info: TokenExpiryInfo): void {
    if (info.expired) {
      this.handleSessionExpired();
      return;
    }

    this.remainingSeconds = Math.max(info.seconds_remaining ?? 0, 0);
    if (this.remainingSeconds <= 0) {
      this.handleSessionExpired();
      return;
    }

    if (!this.warningDialogRef) {
      this.openWarningDialog();
    }

    this.startCountdown(this.remainingSeconds);
  }

  private openWarningDialog(): void {
    this.warningDialogData = {
      title: 'Tu sesión está por expirar',
      message: '',
      type: 'warning',
      confirmButtonText: 'Mantener sesión',
      cancelButtonText: 'Cerrar sesión ahora',
      disableBackdropClick: true
    };

    this.warningDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.warningDialogData,
      width: '420px',
      panelClass: 'session-expiring-dialog',
      disableClose: true
    });

    this.warningDialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        const skipHandling = this.ignoreDialogClose;
        this.ignoreDialogClose = false;
        this.warningDialogRef = undefined;
        this.warningDialogData = null;
        this.clearCountdown();

        if (skipHandling) {
          return;
        }

        if (result) {
          this.handleExtendSession();
        } else {
          this.handleManualLogout();
        }
      });

    this.updateWarningMessage();
  }

  private startCountdown(initialSeconds: number): void {
    this.clearCountdown();
    this.remainingSeconds = Math.max(initialSeconds, 0);
    this.updateWarningMessage();

    if (this.remainingSeconds <= 0) {
      this.handleSessionExpired();
      return;
    }

    this.countdownTimerId = setInterval(() => {
      this.remainingSeconds -= 1;

      if (this.remainingSeconds <= 0) {
        this.clearCountdown();
        this.handleSessionExpired();
      } else {
        this.updateWarningMessage();
      }
    }, 1000);
  }

  private updateWarningMessage(): void {
    if (!this.warningDialogData) {
      return;
    }

    const seconds = Math.max(this.remainingSeconds, 0);
    const minutes = Math.floor(seconds / 60);
    const secondsPart = seconds % 60;
    const minutesLabel = minutes > 0 ? `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}` : '';
    const secondsLabel = `${secondsPart} ${secondsPart === 1 ? 'segundo' : 'segundos'}`;
    const timeLabel = minutesLabel ? `${minutesLabel} y ${secondsLabel}` : secondsLabel;

    this.warningDialogData.message = `Tu sesión expirará en ${timeLabel}. ¿Deseas mantenerla activa?`;
  }

  private clearCountdown(): void {
    if (this.countdownTimerId) {
      clearInterval(this.countdownTimerId);
      this.countdownTimerId = null;
    }
  }

  private handleExtendSession(): void {
    this.sessionMonitor.stopMonitoring();

    this.sessionMonitor.refreshToken()
      .pipe(take(1))
      .subscribe({
        next: (response: RefreshTokenResponse) => {
          const token = response?.token;
          if (token) {
            localStorage.setItem('auth_token', token);
          }

          this.restartSessionMonitoring();
        },
        error: () => {
          this.handleSessionExpired();
        }
      });
  }

  private handleManualLogout(): void {
    this.performLogout();
  }

  private handleSessionExpired(): void {
    this.clearCountdown();
    this.closeWarningDialog();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Sesión expirada',
        message: 'Tu sesión ha expirado por inactividad. Debes iniciar sesión nuevamente.',
        type: 'error',
        confirmButtonText: 'Entendido',
        disableBackdropClick: true
      },
      width: '400px',
      panelClass: 'session-expiring-dialog',
      disableClose: true
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.performLogout());
  }

  private closeWarningDialog(): void {
    if (!this.warningDialogRef) {
      return;
    }

    this.ignoreDialogClose = true;
    this.warningDialogRef.close();
  }

  private performLogout(): void {
    this.sessionMonitor.stopMonitoring();

    this.sessionMonitor.logout()
      .pipe(take(1))
      .subscribe({
        next: () => this.finalizeLogout(),
        error: () => this.finalizeLogout()
      });
  }

  private finalizeLogout(): void {
    this.authService.logout();
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  private restartSessionMonitoring(): void {
    this.sessionMonitor.stopMonitoring();
    this.sessionMonitor.startMonitoring();
  }
}
