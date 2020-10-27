import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { MottuDialog } from 'src/app/shared/dialogs/mottu-dialog';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {


    constructor(public dialog: MatDialog) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request)
            .pipe(
                retry(1),
                catchError((error: HttpErrorResponse) => {
                    let errorMessage = '';
                    if (error.error instanceof ErrorEvent) {
                        errorMessage = `Error: ${error.error.message}`;
                    } else {
                        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
                    }

                    this.dialog.open(MottuDialog, {
                        width: '500px',
                        disableClose: true,
                        data: {
                            data: null,
                            message: {
                                title: 'Ops..',
                                body: errorMessage
                            }
                        }
                    });
                    return throwError(errorMessage);
                })
            )
    }
}