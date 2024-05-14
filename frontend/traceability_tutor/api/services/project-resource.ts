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
  ProjectDTO
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
export class ProjectResourceService {
  constructor(
    private http: HttpClient,
  ) {} getProject<TData = ProjectDTO>(
    id: number, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.get<TData>(
      `/api/projects/${id}`,options
    );
  }
 updateProject<TData = number>(
    id: number,
    projectDTO: ProjectDTO, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.put<TData>(
      `/api/projects/${id}`,
      projectDTO,options
    );
  }
 deleteProject<TData = void>(
    id: number, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.delete<TData>(
      `/api/projects/${id}`,options
    );
  }
 updateLastOpened<TData = number>(
    id: number, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.put<TData>(
      `/api/projects/open/${id}`,undefined,options
    );
  }
 getAllProjects<TData = ProjectDTO[]>(
     options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.get<TData>(
      `/api/projects`,options
    );
  }
 createProject<TData = number>(
    projectDTO: ProjectDTO, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.post<TData>(
      `/api/projects`,
      projectDTO,options
    );
  }
 getUserProjects<TData = ProjectDTO[]>(
    id: number, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.get<TData>(
      `/api/projects/user/${id}`,options
    );
  }
};

export type GetProjectClientResult = NonNullable<ProjectDTO>
export type UpdateProjectClientResult = NonNullable<number>
export type DeleteProjectClientResult = NonNullable<void>
export type UpdateLastOpenedClientResult = NonNullable<number>
export type GetAllProjectsClientResult = NonNullable<ProjectDTO[]>
export type CreateProjectClientResult = NonNullable<number>
export type GetUserProjectsClientResult = NonNullable<ProjectDTO[]>
