import { Component, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';


import { RouterOutlet,Router,RouterLink,RouterLinkActive} from '@angular/router';
import { AuthService } from '../services/auth.service';



@Component({
  selector: 'app-nvbar',
  standalone: true,
  imports: [NgClass, RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './nvbar.component.html',
  styleUrl: './nvbar.component.css'
})
export class NvbarComponent {
  constructor(private router: Router, private authService:AuthService) {}
  isShrunk: boolean = false;
  
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY;
    this.isShrunk = scrollPosition > 100; // Cambia a tamaño reducido si el scroll es mayor a 100px
  }
  
  navigateToAdminUsers() {
    this.router.navigate(['/admin-users']);
  }
  logout(): void {
    this.authService.logout();
  }

}
