import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationStart, Router } from "@angular/router";
import { combineLatest, filter, map, Observable } from "rxjs";
import { BoardsService } from "../../../shared/services/boards.service";
import { ColumnsService } from "../../../shared/services/columns.service";
import { SocketService } from "../../../shared/services/socket.service";
import { BoardInterface } from "../../../shared/types/board.interface";
import { ColumnInterface } from "../../../shared/types/column.interface";
import { ColumnInputInterface } from "../../../shared/types/columnInput.interface";
import { SocketEventsEnum } from "../../../shared/types/socketEvents.enum";
import { TaskInputInterface } from "../../../shared/types/taskInput.interface";
import { BoardService } from "../../services/board.service";
import { TasksService } from 'src/app/shared/services/tasks.service';
import { TaskInterface } from 'src/app/shared/types/task.interface';

@Component({
  selector: "board",
  templateUrl: "./board.component.html",
})
export class BoardComponent implements OnInit {
  boardId: string;
  // Вместо двух отдельных стримов данных определяем один стрим
  data$: Observable<{
    board: BoardInterface;
    columns: ColumnInterface[];
    tasks: TaskInterface[];
  }>;
  // board$: Observable<BoardInterface>;
  // columns$: Observable<ColumnInterface[]>;

  constructor(
    private boardsService: BoardsService,
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private socketService: SocketService,
    private columnsService: ColumnsService,
    private tasksService: TasksService,
  ) {
    const boardId = this.route.snapshot.paramMap.get("boardId");
    if (!boardId){
      throw new Error("Can not get boardId from URL");
    }
    this.boardId = boardId;

    this.data$ = combineLatest([
      this.boardService.board$.pipe(filter(Boolean)),
      this.boardService.columns$,
      this.boardService.tasks$,
    ])
      // pipe(fn) берет на вход очередной элемент потока, преобразует его с
      // помощью функции fn и результат отправляет дальше.
      // Поток двухчленных массивов преобразуем в поток двучленных объектов.
      .pipe(
        map(([board, columns, tasks]) => ({
            board,
            columns,
            tasks,
          }),
        ),
      );
    //--------------- Вариант без комбайна
    // // Здесь нам не нужны null-члены потока стейтов, поэтому фильтруем их
    // this.board$ = this.boardService.board$.pipe(filter(Boolean));
    // this.columns$ = this.boardService.columns$;
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

    this.columnsService.getColumns(this.boardId).subscribe(columns => {
      this.boardService.setColumns(columns);
    });

    this.tasksService.getTasks(this.boardId).subscribe((tasks) => {
      this.boardService.setTasks(tasks);
    });
  }

  test() {
    this.socketService.emit("columns:create", {
      boardId: this.boardId,
      title: "column foo",
    });
  }

  createColumn(title: string) {
    console.log("create column", title);
    const columnInput: ColumnInputInterface = {
      title,
      boardId: this.boardId,
    };
    this.columnsService.createColumn(columnInput);
  }

  private initializeListeners(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart){
        console.log("NavigationStart event occurs");
        this.boardService.leaveBoard(this.boardId);
      }
      // todo ???
    });

    this.socketService.listen<ColumnInterface>(
      SocketEventsEnum.columnsCreateSuccess).subscribe(column => {
      console.log("created column", column.title);
      this.boardService.addColumn(column);
    });

    this.socketService
      .listen<TaskInterface>(SocketEventsEnum.tasksCreateSuccess)
      .subscribe((task) => {
        this.boardService.addTask(task);
      });
  }

  createTask(title: string, columnId: string): void {
    const taskInput: TaskInputInterface = {
      title,
      boardId: this.boardId,
      columnId,
    };
    this.tasksService.createTask(taskInput);
  }

  getTasksByColumn(columnId: string, tasks: TaskInterface[]): TaskInterface[] {
    return tasks.filter((task) => task.columnId === columnId);
  }

}

