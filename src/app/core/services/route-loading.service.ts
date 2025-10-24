import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RouteLoadingService {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$: Observable<boolean> = this.loadingSubject.asObservable();

    private hidingSubject = new BehaviorSubject<boolean>(false);
    public hiding$: Observable<boolean> = this.hidingSubject.asObservable();

    show(): void {
        this.hidingSubject.next(false);
        this.loadingSubject.next(true);
    }

    hide(): void {
        // Activar animación de salida
        this.hidingSubject.next(true);

        // Después de la animación, ocultar completamente
        setTimeout(() => {
            this.loadingSubject.next(false);
            this.hidingSubject.next(false);
        }, 800); // Duración de la animación de salida
    }

    isShowing(): boolean {
        return this.loadingSubject.value;
    }
}
