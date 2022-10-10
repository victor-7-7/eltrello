import { Component, OnInit } from "@angular/core";
import { AuthService } from "./auth/services/auth.service";
import { SocketService } from "./shared/services/socket.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private socketService: SocketService) {
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log("user", user);
        this.socketService.setupSocketConnection(user)
        this.authService.setCurrentUser(user);
      },
      error: (err) => {
        console.log("err", err);
        this.authService.setCurrentUser(null);
      },
    });
  }
}
