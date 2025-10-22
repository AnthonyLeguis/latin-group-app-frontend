import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ContactModalService {
    private isOpenSubject = new BehaviorSubject<boolean>(false);
    public isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();

    openModal(): void {
        this.isOpenSubject.next(true);
    }

    closeModal(): void {
        this.isOpenSubject.next(false);
    }
}
