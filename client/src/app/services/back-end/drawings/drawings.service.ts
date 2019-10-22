import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Drawing} from '../../../../../../common/communication/Drawing';
import {RendererLoaderService} from '../../renderer-loader/renderer-loader.service';

@Injectable({
  providedIn: 'root',
})
export class DrawingsService {

  private readonly HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
    }),
  };

  private readonly HTTP_CODE_SUCCESS = 200;
  private readonly BASE_URL: string = 'http://localhost:3000/api/drawings/';

  constructor(private httpClient: HttpClient,
              private rendererLoader: RendererLoaderService) {}

  httpPostDrawing(name: string, tags: string[]): Promise<boolean> {
    const svgElements: string = this.getSvgElements();
    const miniature: string = this.getMiniature();
    const drawing: Drawing = {id: -1, name, svgElements, tags, miniature};
    return this.httpClient.post<{httpCode: number}>(this.BASE_URL, {data: drawing}, this.HTTP_OPTIONS)
      .toPromise()
      .then( (response: {httpCode: number}) => {
        return response.httpCode === this.HTTP_CODE_SUCCESS;
      })
      .catch((err: HttpErrorResponse) => {
        return this.handleError(err);
      });
  }

  httpGetDrawings(): Observable<Drawing[]> {
    return this.httpClient.get<Drawing[]>(this.BASE_URL).pipe(
      catchError(this.handleErrorGet<Drawing[]>('httpGetDrawings')),
    );
  }

  httpDeleteDrawing(id: number): Promise<boolean> {
    return this.httpClient.delete<boolean>(this.BASE_URL + id, this.HTTP_OPTIONS).toPromise();
  }

  private handleErrorGet<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
    console.error(error);
    return of(result as T);
    };
  }

  getSvgElements(): string {
    const svgCanvas: HTMLElement = this.rendererLoader._renderer.selectRootElement('#canvas', true);
    const patternsEndDef = '</defs>';
    const startIndex = svgCanvas.innerHTML.search(patternsEndDef) + patternsEndDef.length;
    return svgCanvas.innerHTML.substring(startIndex);
  }

  getMiniature(): string {
    const miniature = this.rendererLoader._renderer.selectRootElement('#min', true);
    return (new XMLSerializer()).serializeToString(miniature);
  }

  private handleError(error: HttpErrorResponse): Promise<never> {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
      return throwError(
        'A client side network error occurred').toPromise();
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
      return throwError(
        'The backend returned an unsuccessful response code').toPromise();
    }
  }

}