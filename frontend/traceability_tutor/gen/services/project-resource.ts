/**
 * Generated by orval v6.29.1 🍺
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
  CreateProjectDTO,
  ProjectDTO,
  ProjectSettings
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
 getProjectSettings<TData = ProjectSettings>(
    id: number, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.get<TData>(
      `/api/projects/settings/${id}`,options
    );
  }
 updateProjectSettings<TData = number>(
    id: number,
    projectSettings: ProjectSettings, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.put<TData>(
      `/api/projects/settings/${id}`,
      projectSettings,options
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
    createProjectDTO: CreateProjectDTO, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.post<TData>(
      `/api/projects`,
      createProjectDTO,options
    );
  }
 getUserProjects<TData = ProjectDTO[]>(
    id: number, options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.get<TData>(
      `/api/projects/user/${id}`,options
    );
  }
 setupDemoProject<TData = number>(
     options?: HttpClientOptions
  ): Observable<TData>  {
    return this.http.get<TData>(
      `/api/projects/demo`,options
    );
  }
}

export type GetProjectClientResult = NonNullable<ProjectDTO>
export type UpdateProjectClientResult = NonNullable<number>
export type DeleteProjectClientResult = NonNullable<void>
export type GetProjectSettingsClientResult = NonNullable<ProjectSettings>
export type UpdateProjectSettingsClientResult = NonNullable<number>
export type UpdateLastOpenedClientResult = NonNullable<number>
export type GetAllProjectsClientResult = NonNullable<ProjectDTO[]>
export type CreateProjectClientResult = NonNullable<number>
export type GetUserProjectsClientResult = NonNullable<ProjectDTO[]>
export type SetupDemoProjectClientResult = NonNullable<number>
