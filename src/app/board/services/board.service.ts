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

  updateBoard(updatedBoard: BoardInterface): void {
    const board = this.board$.getValue();
    if (!board) {
      throw new Error('Board is not initialized');
    }
    // { ...board, title: updatedBoard.title } - это синтаксис обновления
    // объекта board по полю title. Так называемое слияние.
    this.board$.next({ ...board, title: updatedBoard.title });
  }

  updateColumn(updatedColumn: ColumnInterface): void {
    const updatedColumns = this.columns$.getValue().map((column) => {
      if (column.id === updatedColumn.id) {
        return { ...column, title: updatedColumn.title };
      }
      return column;
    });
    this.columns$.next(updatedColumns);
  }

  deleteColumn(columnId: string): void {
    const updatedColumns = this.columns$
      .getValue()
      .filter((column) => column.id !== columnId);
    this.columns$.next(updatedColumns);
  }

  updateTask(updatedTask: TaskInterface): void {
    const updatedTasks = this.tasks$.getValue().map((task) => {
      if (task.id === updatedTask.id) {
        return {
          ...task,
          title: updatedTask.title,
          description: updatedTask.description,
          columnId: updatedTask.columnId,
        };
      }
      return task;
    });
    this.tasks$.next(updatedTasks);
  }

  deleteTask(taskId: string): void {
    const updatedTasks = this.tasks$
      .getValue()
      .filter((task) => task.id !== taskId);
    this.tasks$.next(updatedTasks);
  }
}



