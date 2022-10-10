import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuardService } from "../auth/services/authGuard.service";
import { BoardComponent } from "./components/board/board.component";
import { BoardService } from "./services/board.service";

const routes: Routes = [
  {
    path: "boards/:boardId",
    component: BoardComponent,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [BoardComponent],
  providers: [BoardService]
})
export class BoardModule {

}


