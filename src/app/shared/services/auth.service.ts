import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { LocalStoreService } from "./local-store.service";
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: "root"
})
export class AuthService {
 // private apiUrl =  'https://api.districobon.com';
      private apiUrl = 'http://localhost:8080';

  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    public store: LocalStoreService,
    private router: Router
  ) {}

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    const token = this.store.getItem('token');
    const user = this.store.getItem('user');

    // Vérifie si le token existe et n'est pas expiré
    return !!token && !this.jwtHelper.isTokenExpired(token) && !!user;
  }

  // Se connecter
  signin(credentials: { login: string; mot_de_passe: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap((response: any) => {
        if (response.success === true) {
          // Stocker le token ET les infos utilisateur
          this.store.setItem("token", response.token);
          this.store.setItem("user", response.user);
          this.router.navigate(["/dashboard/v2"]);
        } else {
          console.error("Connexion refusée :", response.message);
        }
      }),
      catchError((error) => {
        console.error("Erreur de connexion", error);
        throw error;
      })
    );
  }

  // Récupérer les infos utilisateur
  getUser(): any {
    return this.store.getItem("user");
  }

  // Récupérer le token
  getToken(): string | null {
    return this.store.getItem("token");
  }

  // Se déconnecter
  signout() {
    this.store.removeItem("user");
    this.store.removeItem("token");
    this.router.navigateByUrl("/sessions/signin");
  }
}
