import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {DividerModule} from 'primeng/divider';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {EditorService} from "../../../services/editor/editor.service";
import {StateManager} from "../../../models/state";
import {ItemType} from "../../../../../gen/model";
import {Item} from "../../../models/itemMapper";

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss'],
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
export class ItemFormComponent implements OnInit, OnChanges {
  @Output() onItemCreate = new EventEmitter<any>();
  itemForm!: FormGroup;
  submitted = false;
  statuses: string[] = [];
  linksLabel: string = '';

  @Input() itemType: ItemType | undefined;
  @Input() visible: boolean = false;
  @Input() formData: Item | undefined;
  @Output() formDataChange = new EventEmitter<Item>;
  @Input() mode: "create" | "update" = "create";

  constructor(private fb: FormBuilder,
              public editorService: EditorService,
              private state: StateManager) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.formData) {
      // update mode: formData takes priority over itemType input
      this.itemType = this.formData.itemType;
      this.initializeForm();
    } else if (changes['itemType'] && this.itemType) {
      // create mode: itemType comes from parent
      this.initializeForm();
    }
  }

  initializeForm(): void {
    if (this.formData) {
      const linksArray = this.formData.data.links.map(link => this.fb.group({
        linkOrComment: [link.linkOrComment, Validators.required],
        addedAt: [link.addedAt, Validators.required]
      }));

      this.itemForm = this.fb.group({
        name: [this.formData.data.name, Validators.required],
        level: [this.formData.data.level, Validators.required],
        status: [this.formData.status, Validators.required],
        description: [ {value: this.formData.data.description || '', disabled: this.itemType === ItemType.CODE}],
        links: this.fb.array(linksArray),
        newLink: ['']
      });
    } else {
      this.itemForm = this.fb.group({
        name: ['', Validators.required],
        level: ['', Validators.required],
        status: ['', Validators.required],
        description: [''],
        links: this.fb.array([]),
        newLink: ['']
      });
    }
    this.setLinksLabel();
    this.statuses = this.editorService.getStatuses(this.itemType);
    const levelNames = this.editorService.getLevelNames(this.itemType);
    if (levelNames.length == 1) {
      this.itemForm.get('level')?.disable();
      this.itemForm.get('level')?.setValue(levelNames[0]);
    }
  }

  private setLinksLabel(): void {
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
        return 'Add a new link';
    }
  }

  addLink(): void {
    const newLinkControl = this.itemForm.get('newLink');
    if (newLinkControl && newLinkControl.value.trim() !== '') {
      this.links.push(this.fb.group({
        linkOrComment: [newLinkControl.value, Validators.required],
        addedAt: [new Date(), Validators.required]
      }));
      newLinkControl.reset();
    }
  }

  clearLinks(): void {
    this.links.clear();
  }

  resetItemForm(): void {
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
        projectId: this.state.currentProject()?.id,
      };
      this.onItemCreate.emit(newItem);
      this.resetItemForm();
    }
  }

  prepareFormData(): void {
    this.submitted = true;
    if (this.itemForm.valid) {
      const { newLink, status, ...formValueWithoutNewLink } = this.itemForm.value;
      const updatedItem: Item = {
        ...this.formData!,
        data: {
          ...formValueWithoutNewLink
        },
        status: this.itemForm.get('status')!.value,
      };
      this.formData = updatedItem;
      this.formDataChange.emit(updatedItem);
      this.resetItemForm();
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  protected readonly ItemType = ItemType;
}
