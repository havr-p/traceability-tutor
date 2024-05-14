/**
 * Generated by orval v6.28.2 🍺
 * Do not edit manually.
 * traceability-tutor
 */
import {
  HttpClient
} from '@angular/common/http'
import type {
  HttpContext,
  HttpHeaders,
  HttpParams
} from '@angular/common/http'
import {
  Injectable
} from '@angular/core'
import {
  Observable
} from 'rxjs'
import type {
  ItemDTO
} from '../model'



type HttpClientOptions = {
  headers?: HttpHeaders | {
      [header: string]: string | string[];
  };
  context?: HttpContext;
  observe?: any;
  params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
  reportProgress?: boolean;
  responseType?: any;
  withCredentials?: boolean;
};



@Injectable({ providedIn: 'root' })
export class ItemResourceService {
  constructor(
    private http: HttpClient,
  ) {} getItem<TData = ItemDTO>(
    id: number, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.get<TData>(
      `/api/items/${id}`,options
    );
  }
 updateItem<TData = number>(
    id: number,
    itemDTO: ItemDTO, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.put<TData>(
      `/api/items/${id}`,
      itemDTO,options
    );
  }
 deleteItem<TData = void>(
    id: number, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.delete<TData>(
      `/api/items/${id}`,options
    );
  }
 getAllItems<TData = ItemDTO[]>(
     options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.get<TData>(
      `/api/items`,options
    );
  }
 createItem<TData = number>(
    itemDTO: ItemDTO, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.post<TData>(
      `/api/items`,
      itemDTO,options
    );
  }
};

export type GetItemClientResult = NonNullable<ItemDTO>
export type UpdateItemClientResult = NonNullable<number>
export type DeleteItemClientResult = NonNullable<void>
export type GetAllItemsClientResult = NonNullable<ItemDTO[]>
export type CreateItemClientResult = NonNullable<number>
