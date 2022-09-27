import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { CurrentUserInterface } from "../types/currentUser.interface";
import { LoginRequestInterface } from "../types/loginRequest.interface";
import { RegisterRequestInterface } from "../types/registerRequest.interface";

@Injectable()
export class AuthService {
  // Стрим-член ($)
  currentUser$ = new BehaviorSubject<CurrentUserInterface | null | undefined>(
    undefined,
  );

  constructor(private http: HttpClient) {
  }

  register(registerRequest: RegisterRequestInterface): Observable<CurrentUserInterface> {
    const url = environment.apiUrl + "/users";
    return this.http.post<CurrentUserInterface>(url, registerRequest);
  }

  login(loginRequest: LoginRequestInterface): Observable<CurrentUserInterface> {
    const url = environment.apiUrl + "/users/login";
    return this.http.post<CurrentUserInterface>(url, loginRequest);
  }

  setToken(currentUser: CurrentUserInterface): void {
    localStorage.setItem("token", currentUser.token);
  }

  getCurrentUser(): Observable<CurrentUserInterface> {
    const url = environment.apiUrl + "/user";
    return this.http.get<CurrentUserInterface>(url);
  }

  setCurrentUser(user: CurrentUserInterface | null): void {
    this.currentUser$.next(user);
  }
}

