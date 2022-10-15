import { Component, HostBinding, OnDestroy } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest, filter, map, Observable, Subject, takeUntil } from "rxjs";
import { SocketService } from "../../../shared/services/socket.service";
import { TasksService } from "../../../shared/services/tasks.service";
import { ColumnInterface } from "../../../shared/types/column.interface";
import { SocketEventsEnum } from "../../../shared/types/socketEvents.enum";
import { TaskInterface } from "../../../shared/types/task.interface";
import { BoardService } from "../../services/board.service";

@Component({
  selector: "task-modal",
  templateUrl: "./taskModal.component.html",
})
export class TaskModalComponent implements OnDestroy {
  @HostBinding("class") classes = "task-modal";

  boardId: string;
  taskId: string;
  task$: Observable<TaskInterface>;
  data$: Observable<{ task: TaskInterface; columns: ColumnInterface[] }>;
  columnForm = this.fb.group({
    columnId: new FormControl(),
    // columnId: [null], <- вариант из видео, кидающий ошибку при компиляции
  });
  unsubscribe$ = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private tasksService: TasksService,
    private socketService: SocketService,
    private fb: FormBuilder,
  ) {
    const taskId = this.route.snapshot.paramMap.get("taskId");
    const boardId = this.route.parent?.snapshot.paramMap.get("boardId");

    if (!boardId){
      throw new Error("Can't get boardID from URL");
    }

    if (!taskId){
      throw new Error("Can't get taskID from URL");
    }

    this.taskId = taskId;
    this.boardId = boardId;
    this.task$ = this.boardService.tasks$.pipe(
      map((tasks) => {
        return tasks.find((task) => task.id === this.taskId);
      }),
      // Из мапы выйдет массив булевых значений, среди которых только
      // одно - true. Его мы и выпустим наружу
      filter(Boolean),
    );
    this.data$ = combineLatest([this.task$, this.boardService.columns$]).pipe(
      map(([task, columns]) => ({
        task,
        columns,
      })),
    );
    this.task$.pipe(takeUntil(this.unsubscribe$)).subscribe((task) => {
      // Обновим вид задачи в браузере, если пришло новое значение из task$-стрима
      this.columnForm.patchValue({ columnId: task.columnId });
    });

    combineLatest([this.task$, this.columnForm.get('columnId')!.valueChanges])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([task, columnId]) => {
        // Только если мы изменили столбец
        if (task.columnId !== columnId) {
          // То изменим для таска айди столбца. Тем самым мы переместим эту
          // задачу из одного столбца в другой
          this.tasksService.updateTask(this.boardId, task.id, { columnId });
        }
      });

    this.socketService
      .listen<string>(SocketEventsEnum.tasksDeleteSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.goToBoard();
      });
  }

  goToBoard(): void {
    this.router.navigate(["boards", this.boardId]);
  }

  updateTaskName(taskName: string): void {
    console.log("updateTaskName", taskName);
    this.tasksService.updateTask(this.boardId, this.taskId, { title: taskName });
  }

  updateTaskDescription(taskDescription: string): void {
    console.log("updateTaskDescription", taskDescription);
    this.tasksService.updateTask(this.boardId, this.taskId, {
      description: taskDescription,
    });
  }

  deleteTask() {
    this.tasksService.deleteTask(this.boardId, this.taskId);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }
}
