import { Component, HostListener, OnInit } from '@angular/core';


@Component({
    selector: 'app-private',
    templateUrl: './private.page.html',
    styleUrls: ['./private.page.scss'],
})
export class PrivatePage implements OnInit {
    isUserMenuOpen = false;

    constructor() { }

    ngOnInit(): void { }

    toggleUserMenu(event: MouseEvent) {
        event.stopPropagation();
        this.isUserMenuOpen = !this.isUserMenuOpen;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick() {
        if (this.isUserMenuOpen) {
            this.isUserMenuOpen = false;
        }
    }

    @HostListener('document:keydown.escape')
    onEscClose() {
        this.isUserMenuOpen = false;
    }
}