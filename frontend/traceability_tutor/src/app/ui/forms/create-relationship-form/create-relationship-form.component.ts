import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors, ValidatorFn,
    Validators
} from '@angular/forms';
import {catchError, defer, Observable, of, switchMap} from 'rxjs';
import {CreateRelationshipDTO, RelationshipDTO, RelationshipType} from "../../../../../gen/model";
import {EditorService} from "../../../services/editor/editor.service";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {NgIf} from "@angular/common";
import {EventService} from "../../../services/event/event.service";
import {InputTextareaModule} from "primeng/inputtextarea";
import {InputTextModule} from "primeng/inputtext";
import {BaseEvent, EditorEventType, EventSource} from "../../../types";
import {DialogModule} from "primeng/dialog";

@Component({
  selector: 'app-create-relationship-form',
  templateUrl: './create-relationship-form.component.html',
  styleUrls: ['./create-relationship-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    DropdownModule,
    ButtonModule,
    NgIf,
    InputTextareaModule,
    InputTextModule,
    DialogModule
  ],
  standalone: true
})
export class CreateRelationshipFormComponent {
  @Output() onRelationshipCreation = new EventEmitter<boolean>();
  @Input() visible = false;

  relationshipForm!: FormGroup;
  relationshipTypes = Object.values(RelationshipType);
  mode: 'create' | 'update' = 'create'

  constructor(private fb: FormBuilder, private editorService: EditorService, private eventService: EventService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.eventService.event$.subscribe(async (event: BaseEvent<EventSource, EditorEventType>) => {
      console.log('Event received in form component:', event);
      if (event.source === EventSource.EDITOR) {
        switch (event.type) {
          case EditorEventType.ADD_RELATIONSHIP:
            if (event.payload) {
              this.relationshipForm.patchValue({
                startItem: event.payload.startItem,
                endItem: event.payload.endItem
              });
              this.mode = 'create';
            }
            this.visible = true;
            break;
          case EditorEventType.SELECT_RELATIONSHIP:
            this.relationshipForm.patchValue(event.payload);
            this.mode = 'update';
            break;
        }
      }
    });
  }

  notCreatingCycleValidator(): AsyncValidatorFn {
      return (control: AbstractControl): Observable<ValidationErrors | null> => {
          const endItem = control.get('endItem')?.value;
          const startItem = control.get('startItem')?.value;

          if (startItem == null || endItem == null) {
              return new Observable<ValidationErrors | null>((observer) => {
                  observer.next(null);
                  observer.complete();
              });
          }

          return defer(async () => this.editorService.itemsExist(startItem, endItem)).pipe(
              switchMap(exist => {
                  if (!exist) {
                      return of({ itemsDoNotExist: true });
                  }
                  return defer(() => this.editorService.notCreateCycle(startItem, endItem).then(
                      isValid => (isValid ? null : { notCreatingCycle: true })
                  ));
              }),
              catchError(() => of(null)) // Обработка возможных ошибок
          );
    };
  }

  submitForm() {
    if (this.relationshipForm.valid) {
      const formValue = this.relationshipForm.getRawValue();
      const createRelationshipDTO: CreateRelationshipDTO = {
        startItem: formValue.startItem,
        endItem: formValue.endItem,
        type: formValue.type,
        description: formValue.description
      };

      if (this.mode === 'create') {
        this.editorService.createConnection(createRelationshipDTO).then(
          () => {
            this.relationshipForm.reset();
            this.eventService.notify('Relationship was created successfully.', 'success');
            this.onRelationshipCreation.emit(true);
          }
        );
      } else if (this.mode === 'update') {
        this.editorService.updateRelationship(createRelationshipDTO).then(
          () => {
            this.relationshipForm.reset();
            this.eventService.notify('Relationship was updated successfully.', 'success');
            this.onRelationshipCreation.emit(true);
          }
        );
      }
      this.relationshipForm.reset();
    }
  }

  private initializeForm() {
    this.relationshipForm = this.fb.group({
      startItem: ['', [Validators.required]],
      endItem: ['', [Validators.required]],
      type: ['', [Validators.required]],
      description: ['', [Validators.maxLength(255)]]
    }, {
      validators: [],
      asyncValidators: [this.notCreatingCycleValidator()]
    });
  }


  }

