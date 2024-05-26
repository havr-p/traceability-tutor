import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { EditorModule } from 'primeng/editor';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { InplaceModule } from 'primeng/inplace';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ItemType } from "../../../../gen/model";
import { NgxColorsModule } from "ngx-colors";
import { OrderListModule } from "primeng/orderlist";
import { TabViewModule } from "primeng/tabview";
import { EditorService } from "../../services/editor/editor.service";
import { ConnProps } from "../../types";
import { StateManager } from "../../models/state";
import { Item, RequirementData, DesignData, CodeData, TestData } from "../../models/itemMapper";
import {RelationshipTableComponent} from "../relationship-table/relationship-table.component";

@Component({
  selector: 'app-item-info-view',
  templateUrl: './item-info-view.component.html',
  styleUrls: ['./item-info-view.component.sass'],
  standalone: true,
  imports: [
    PanelModule,
    EditorModule,
    DropdownModule,
    TableModule,
    NgSwitch,
    NgSwitchDefault,
    InplaceModule,
    NgSwitchCase,
    FormsModule,
    NgForOf,
    InputTextModule,
    InputTextareaModule,
    NgIf,
    NgxColorsModule,
    OrderListModule,
    ReactiveFormsModule,
    TabViewModule,
    RelationshipTableComponent,
  ],
})
export class ItemInfoViewComponent implements AfterViewInit, OnChanges {
  @Input() item!: Item;
  @Output() toggleVisible = new EventEmitter<boolean>();
  @Output() viewInitialized = new EventEmitter<void>();
  @Input() editorService!: EditorService;
  relationships: ConnProps[] = [];
  dataChanged = false;
  itemForm: FormGroup;
  protected readonly ItemType = ItemType;
  protected readonly JSON = JSON;

  constructor(
      private fb: FormBuilder,
      private cdr: ChangeDetectorRef,
      private state: StateManager,
  ) {
    this.itemForm = this.fb.group({
      level: ['', Validators.required],
      name: ['', Validators.required],
      statement: [''],
      status: ['', Validators.required],
    });
  }

  saveChanges() {
    if (this.itemForm.valid) {
      this.dataChanged = true;
      // Add logic to save changes based on item type
    }
  }

  cancelChanges() {
    this.toggleVisible.emit(false);
  }

  ngAfterViewInit(): void {
    this.viewInitialized.emit();
    if (this.editorService && this.item) {
      this.relationships = this.editorService.getRelationships(this.item);
      console.log("relationships", this.relationships);
    }
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.initializeForm(this.item);
      this.relationships = this.editorService.getRelationships(this.item);
      this.editorService.focusOnNode(this.item.id.toString());
    }
  }

  initializeForm(item: Item) {
    this.itemForm.patchValue({
      level: item.data.level,
      name: item.data.name,
      status: item.status,
    });
  }

}
