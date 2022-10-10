import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { map, Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    return this.authService.isLogged$.pipe(
      map(isLoggedIn => {
        if (isLoggedIn){
          return true;
        }
        this.router.navigateByUrl("/").then(() => {
          console.log("User is not logged in");
        });
        return false;
      }),
    );
  }

}

