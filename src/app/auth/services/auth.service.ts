import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, filter, map, Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { SocketService } from "../../shared/services/socket.service";
import { CurrentUserInterface } from "../types/currentUser.interface";
import { LoginRequestInterface } from "../types/loginRequest.interface";
import { RegisterRequestInterface } from "../types/registerRequest.interface";

@Injectable()
export class AuthService {
  // Стрим-член ($)
  currentUser$ = new BehaviorSubject<CurrentUserInterface | null | undefined>(
    undefined,
  );
  isLogged$ = this.currentUser$.pipe(
    // Выбрасываем из пайма undefined-значения. Оставляем только Object | null
    filter(user => user !== undefined),
    // Преобразуем в поток true/false значений
    // map(user => Boolean(user)),
    map(Boolean), // Более короткая запись
  );

  constructor(private http: HttpClient, private socketService: SocketService) {
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

  logout(): void {
    localStorage.removeItem("token");
    this.currentUser$.next(null);
    this.socketService.disconnect();
  }
}

