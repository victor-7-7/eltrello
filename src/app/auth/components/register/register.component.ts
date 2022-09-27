import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { RegisterRequestInterface } from "../../types/registerRequest.interface";

@Component({
  selector: "auth-register",
  templateUrl: "./register.component.html",
})
export class RegisterComponent {
  errorMessage: string | null = null;

  form = this.fb.group({
    email: ["", Validators.required],
    username: ["", Validators.required],
    password: ["", Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
  }

  onSubmit(): void {
    // console.log("onSubmit: form.value", this.form.value);
    const registerRequest = this.form.value as RegisterRequestInterface;
    console.log("onSubmit: registerRequest", registerRequest);

    this.authService.register(registerRequest).subscribe({
      next: (registeredUser) => {
        console.log("currentUser", registeredUser);
        this.authService.setToken(registeredUser);
        this.authService.setCurrentUser(registeredUser);
        this.errorMessage = null;
        this.router.navigateByUrl("/").then(() => {
          console.log("Success register");
        });
      },
      error: (err: HttpErrorResponse) => {
        console.log("err", err.error);
        // ERROR TypeError: err.error.join is not a function
        // this.error = err.error.join(", ");

        // const comma = (this.error != null) ? ", " : "";
        // this.error = this.error + comma + err.error

        this.errorMessage = err.error;
      },
    });
  }
}

