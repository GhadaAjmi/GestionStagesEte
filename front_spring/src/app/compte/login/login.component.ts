import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(3)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, motDePasse, rememberMe } = this.loginForm.value;
      console.log('form values:', this.loginForm.value)
      this.authService.login(email, motDePasse).subscribe({
        next: () => {
          this.isLoading = false;

          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          }

          const role = this.authService.getUserRole();
          this.navigateBasedOnRole(role ?? 'ETUDIANT');
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.status === 401
            ? 'Email ou mot de passe incorrect'
            : 'Erreur serveur, réessayez plus tard';
          console.error('Login error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private navigateBasedOnRole(role: string): void {
    const routes: Record<string, string> = {
      'ADMIN': '/admin',
      'RESPONSABLE': '/responsable',
      'ENSEIGNANT': '/enseignant',
      'ETUDIANT': '/etudiant',
     'CHEF_DEPARTEMENT':  '/chef_departement',
      'SERVICE_STAGE': '/service_stage'
    };

    const route = routes[role] ;
    this.router.navigate([route]);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  // Getters pour accéder aux contrôles du formulaire
  get email() {
    return this.loginForm.get('email');
  }

  get motDePasse() {
    return this.loginForm.get('motDePasse');
  }
}
