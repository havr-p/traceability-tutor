/**
 * Generated by orval v6.28.2 🍺
 * Do not edit manually.
 * OpenAPI definition
 * OpenAPI spec version: v0
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
  UserDTO
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
export class UserResourceService {
  constructor(
    private http: HttpClient,
  ) {} getUser<TData = UserDTO>(
    id: number, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.get<TData>(
      `/api/users/${id}`,options
    );
  }
 updateUser<TData = number>(
    id: number,
    userDTO: UserDTO, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.put<TData>(
      `/api/users/${id}`,
      userDTO,options
    );
  }
 deleteUser<TData = void>(
    id: number, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.delete<TData>(
      `/api/users/${id}`,options
    );
  }
 getAllUsers<TData = UserDTO[]>(
     options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.get<TData>(
      `/api/users`,options
    );
  }
 createUser<TData = number>(
    userDTO: UserDTO, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.post<TData>(
      `/api/users`,
      userDTO,options
    );
  }
};

export type GetUserClientResult = NonNullable<UserDTO>
export type UpdateUserClientResult = NonNullable<number>
export type DeleteUserClientResult = NonNullable<void>
export type GetAllUsersClientResult = NonNullable<UserDTO[]>
export type CreateUserClientResult = NonNullable<number>
