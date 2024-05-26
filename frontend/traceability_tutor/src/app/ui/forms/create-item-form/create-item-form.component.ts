import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule} from '@angular/forms';
import {EventService} from "../../../services/event/event.service";
import {EditorService} from "../../../services/editor/editor.service";
import {BaseEvent, EditorEventType, EventSource, ProjectEventType} from "../../../types";
import {CreateItemDTO, ItemType} from "../../../../../gen/model";
import {InputTextareaModule} from "primeng/inputtextarea";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {DividerModule} from "primeng/divider";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {ScrollPanelModule} from "primeng/scrollpanel";
import {StateManager} from "../../../models/state";

@Component({
  selector: 'app-create-item-form',
  templateUrl: './create-item-form.component.html',
  styleUrls: ['./create-item-form.component.scss'],
  standalone: true,
  imports: [
    InputTextareaModule,
    DropdownModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DividerModule,
    NgIf,
    NgForOf,
    DatePipe,
    ScrollPanelModule
  ]
})
export class CreateItemFormComponent implements OnInit, OnChanges {
  @Output() onItemCreate = new EventEmitter<any>();
  @Input() visible: boolean = false;

  itemForm!: FormGroup;
  submitted = false;
  statuses: string[] = [];
  linksLabel: string = '';

  itemType!: ItemType;

  constructor(private fb: FormBuilder,
              private eventService: EventService,
              public editorService: EditorService,
              private state: StateManager) {}

  ngOnInit(): void {
    this.initializeForm();
    this.eventService.event$.subscribe(
        async (event: BaseEvent<EventSource, EditorEventType>) => {
          if (event.source === EventSource.EDITOR) {
            switch (event.type) {
              case EditorEventType.ADD_ITEM:
                this.itemType = event.payload;
                this.editorService.setCreateItemType(event.payload);
                this.visible = true;
                this.statuses = this.editorService.getStatuses(this.itemType);
                this.initializeForm();
                break;
            }
          }
        }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    const type = this.editorService.getCreateItemType();
    if (type) {
      this.initializeForm();
      this.itemType = type;
      this.statuses = this.editorService.getStatuses(type);
    }
  }

  initializeForm(): void {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      statement: ['', Validators.required],
      level: ['', Validators.required],
      status: ['', Validators.required],
      description: ['', Validators.maxLength(255)],
      links: this.fb.array([]),
      newLink: ['']
    });

    switch (this.itemType) {
      case ItemType.DESIGN:
        this.linksLabel = 'Resources';
        break;
      case ItemType.CODE:
        this.linksLabel = 'Commits';
        break;
      case ItemType.TEST:
        this.linksLabel = 'Test reports';
        break;
      case ItemType.REQUIREMENT:
        this.linksLabel = 'Comments';
        break;
      default:
        this.linksLabel = 'Links';
    }
  }

  get links(): FormArray {
    return this.itemForm.get('links') as FormArray;
  }

  get newLinkPlaceholder(): string {
    switch (this.itemType) {
      case ItemType.DESIGN:
        return 'Add a new resource link';
      case ItemType.CODE:
        return 'Add a new VCS link';
      case ItemType.TEST:
        return 'Add a new test report link';
      case ItemType.REQUIREMENT:
        return 'Add a new comment';
      default:
        return '';
    }
  }

  addLink(): void {
    const newLinkControl = this.itemForm.get('newLink');
    if (newLinkControl && newLinkControl.value.trim() !== '') {
      this.links.push(this.fb.group({
        url: [newLinkControl.value, Validators.required],
        addedAt: [new Date(), Validators.required]
      }));
      newLinkControl.reset();
    }
  }

  clearLinks(): void {
    this.links.clear();
  }

  hideDialog(): void {
    this.submitted = false;
    this.itemForm.reset();
    this.clearLinks();
  }


  createItem(): void {
    this.submitted = true;
    if (this.itemForm.valid) {
      const { newLink, ...formValueWithoutNewLink } = this.itemForm.value;
      const newItem = {
        ...formValueWithoutNewLink,
        itemType: this.itemType,
        projectId: this.state.currentProject?.id,

      };
      console.log(newItem)
      this.onItemCreate.emit(newItem);
      this.hideDialog();
    }
  }

  protected readonly ItemType = ItemType;
}
