import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { SocketService } from "../../../shared/services/socket.service";
import { AuthService } from "../../services/auth.service";
import { LoginRequestInterface } from "../../types/loginRequest.interface";

@Component({
  selector: "auth-login",
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  errorMessage: string | null = null;

  form = this.fb.group({
    email: ["", Validators.required],
    password: ["", Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private socketService: SocketService,
  ) {
  }

  onSubmit(): void {
    // console.log("onSubmit: form.value", this.form.value);
    const loginRequest = this.form.value as LoginRequestInterface;
    console.log("onSubmit: loginRequest", loginRequest);

    this.authService.login(loginRequest).subscribe({
      next: (loginedUser) => {
        console.log("currentUser", loginedUser);
        this.authService.setToken(loginedUser);
        this.socketService.setupSocketConnection(loginedUser);
        this.authService.setCurrentUser(loginedUser);
        this.errorMessage = null;
        this.router.navigateByUrl("/").then(() => {
          console.log("Success login");
        });
      },
      error: (err: HttpErrorResponse) => {
        console.log("err", err.error);
        // ERROR TypeError: err.error.join is not a function
        // this.error = err.error.join(", ");

        // const comma = (this.error != null) ? ", " : "";
        // this.error = this.error + comma + err.error

        this.errorMessage = err.error.emailOrPassword;
      },
    });
  }
}

