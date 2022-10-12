import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ColumnInterface } from '../types/column.interface';
import { ColumnInputInterface } from "../types/columnInput.interface";
import { SocketEventsEnum } from "../types/socketEvents.enum";
import { SocketService } from "./socket.service";

@Injectable()
export class ColumnsService {
  constructor(private http: HttpClient, private socketService: SocketService) {}

  getColumns(boardId: string): Observable<ColumnInterface[]> {
    const url = `${environment.apiUrl}/boards/${boardId}/columns`;
    return this.http.get<ColumnInterface[]>(url);
  }

  createColumn(columnInput: ColumnInputInterface) {
    this.socketService.emit(SocketEventsEnum.columnsCreate, columnInput);
  }
}
