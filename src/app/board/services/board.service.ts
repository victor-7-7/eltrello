import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { BoardInterface } from "src/app/shared/types/board.interface";
import { SocketService } from "../../shared/services/socket.service";
import { ColumnInterface } from "../../shared/types/column.interface";
import { SocketEventsEnum } from "../../shared/types/socketEvents.enum";
import { TaskInterface } from 'src/app/shared/types/task.interface';

@Injectable()
export class BoardService {
  board$ = new BehaviorSubject<BoardInterface | null>(null);
  columns$ = new BehaviorSubject<ColumnInterface[]>([]);
  tasks$ = new BehaviorSubject<TaskInterface[]>([]);

  constructor(private socketService: SocketService) {
  }

  setBoard(board: BoardInterface): void {
    this.board$.next(board);
  }

  leaveBoard(boardId: string) {
    this.board$.next(null);
    this.socketService.emit(SocketEventsEnum.boardsLeave, { boardId });
  }

  setColumns(columns: ColumnInterface[]) {
    this.columns$.next(columns);
  }

  addColumn(column: ColumnInterface) {
    const updatedColumns = [...this.columns$.getValue(), column]
    this.columns$.next(updatedColumns);
  }

  setTasks(tasks: TaskInterface[]): void {
    this.tasks$.next(tasks);
  }

  addTask(task: TaskInterface): void {
    const updatedTasks = [...this.tasks$.getValue(), task];
    this.tasks$.next(updatedTasks);
  }
}



