import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    private isExpandedSubject = new BehaviorSubject<boolean>(true);
    public isExpanded$: Observable<boolean> = this.isExpandedSubject.asObservable();

    // Para manejar el estado de apertura en móviles (hamburger menu)
    private isMobileOpenSubject = new BehaviorSubject<boolean>(false);
    public isMobileOpen$: Observable<boolean> = this.isMobileOpenSubject.asObservable();

    toggleSidebar(): void {
        this.isExpandedSubject.next(!this.isExpandedSubject.value);
    }

    setExpanded(value: boolean): void {
        this.isExpandedSubject.next(value);
    }

    getIsExpanded(): boolean {
        return this.isExpandedSubject.value;
    }

    // Métodos para móvil
    toggleMobileSidebar(): void {
        this.isMobileOpenSubject.next(!this.isMobileOpenSubject.value);
    }

    setMobileOpen(value: boolean): void {
        this.isMobileOpenSubject.next(value);
    }

    getIsMobileOpen(): boolean {
        return this.isMobileOpenSubject.value;
    }

    closeMobileSidebar(): void {
        this.isMobileOpenSubject.next(false);
    }
}
