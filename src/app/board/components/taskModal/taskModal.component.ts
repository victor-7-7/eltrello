import { Component, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'task-modal',
  templateUrl: './taskModal.component.html',
})
export class TaskModalComponent {
  @HostBinding('class') classes = 'task-modal';

  boardId: string;
  taskId: string;

  constructor(private route: ActivatedRoute, private router: Router) {
    const taskId = this.route.snapshot.paramMap.get('taskId');
    const boardId = this.route.parent?.snapshot.paramMap.get('boardId');

    if (!boardId) {
      throw new Error("Can't get boardID from URL");
    }

    if (!taskId) {
      throw new Error("Can't get taskID from URL");
    }

    this.taskId = taskId;
    this.boardId = boardId;
  }

  goToBoard(): void {
    this.router.navigate(['boards', this.boardId]);
  }
}
