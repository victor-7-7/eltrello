import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationStart, Router } from "@angular/router";
import { filter, Observable } from "rxjs";
import { BoardsService } from "../../../shared/services/boards.service";
import { SocketService } from "../../../shared/services/socket.service";
import { BoardInterface } from "../../../shared/types/board.interface";
import { SocketEventsEnum } from "../../../shared/types/socketEvents.enum";
import { BoardService } from "../../services/board.service";

@Component({
  selector: "board",
  templateUrl: "./board.component.html",
})
export class BoardComponent implements OnInit {
  boardId: string;
  board$: Observable<BoardInterface>;

  constructor(
    private boardsService: BoardsService,
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private socketService: SocketService,
  ) {
    const boardId = this.route.snapshot.paramMap.get("boardId");
    if (!boardId){
      throw new Error("Can not get boardId from URL");
    }
    this.boardId = boardId;
    // Здесь нам не нужны null-члены потока стейтов, поэтому фильтруем их
    this.board$ = this.boardService.board$.pipe(filter(Boolean));
  }

  ngOnInit(): void {
    // Отправляем сообщение бэкэнду через сокет о том, что юзер выбрал конкретный борд
    this.socketService.emit(SocketEventsEnum.boardsJoin, { boardId: this.boardId });
    this.fetchData();
    this.initializeListeners();
  }

  fetchData(): void {
    this.boardsService.getBoard(this.boardId).subscribe(board => {
      console.log("fetch board", board.title);
      this.boardService.setBoard(board);
    });
  }

  private initializeListeners(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart){
        console.log("NavigationStart event occurs");
        this.boardService.leaveBoard(this.boardId);
      }
      // todo ???
    });
  }
}

