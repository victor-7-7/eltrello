import { Component, OnInit } from "@angular/core";
import { BoardInterface } from "src/app/shared/types/board.interface";
import { BoardsService } from "../../../shared/services/boards.service";

@Component({
  selector: "boards",
  templateUrl: "./boards.component.html",
})
export class BoardsComponent implements OnInit {
  boards: BoardInterface[] = [];

  constructor(private boardsService: BoardsService) {
  }

  ngOnInit(): void {
    this.boardsService.getBoards().subscribe(boards => {
      console.log("boards", boards);
      this.boards = boards;
    });
  }

  createBoard(title: string): void {
    this.boardsService.createBoard(title).subscribe((board) => {
      console.log("title", board.title);
      this.boards = [...this.boards, board];
    });
  }

}
