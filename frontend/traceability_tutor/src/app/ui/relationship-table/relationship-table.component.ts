import {Component, Input} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {SharedModule} from "primeng/api";
import {TabViewModule} from "primeng/tabview";
import {TableModule} from "primeng/table";
import {ConnProps, EditorEventType} from "../../types";
import {EditorService} from "../../services/editor/editor.service";
import {Item} from "../../models/itemMapper";
import {EventService} from "../../services/event/event.service";

@Component({
  selector: 'app-relationship-table',
  standalone: true,
  imports: [
    ButtonModule,
    SharedModule,
    TabViewModule,
    TableModule
  ],
  template: `
    <p-tabView>
      <p-tabPanel header="Ingoing relationships">
        <p-table [value]="ingoingRelationships"
                 [tableStyle]="{ 'min-width': '40rem' }">
          <ng-template pTemplate="header">
            <tr>
              <th>Start Item</th>
              <th>Type</th>
              <th>Description</th>
              <th></th>
              <th></th>
<!--              <th></th>-->
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-relationship>
            <tr>
              <td>{{ relationship.source }}</td>
              <td>{{ relationship.data.type }}</td>
              <td>{{ relationship.data.description }}</td>
              <td>
                <p-button (onClick)="showRelationship(relationship)" [outlined]="true" [rounded]="true" label="Show" severity="info" size="small" styleClass="delete-button"></p-button>
              </td>
<!--              <td>-->
<!--                <p-button (onClick)="editRelationship(relationship)" [outlined]="true" [rounded]="true" label="Edit" severity="secondary" size="small" styleClass="delete-button"></p-button>-->
<!--              </td>-->
              <td>
                <p-button (onClick)="deleteRelationship(relationship)" [outlined]="true" [rounded]="true" label="Delete" severity="danger" size="small" styleClass="delete-button"></p-button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-tabPanel>
      <p-tabPanel header="Outgoing relationships">
        <p-table [value]="outgoingRelationships" [tableStyle]="{ 'min-width': '40rem' }">
          <ng-template pTemplate="header">
            <tr>
              <th>End Item</th>
              <th>Type</th>
              <th>Description</th>
              <th></th>
<!--              <th></th>-->
              <th></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-relationship>
            <tr [pSelectableRow]="relationship">
              <td>{{ relationship.target }}</td>
              <td>{{ relationship.data.type }}</td>
              <td>{{ relationship.data.description }}</td>
              <td>
                <p-button (onClick)="showRelationship(relationship)" [outlined]="true" [rounded]="true" label="Show"  severity="info" size="small"  styleClass="delete-button"></p-button>
              </td>
<!--              <td>-->
<!--                <p-button (onClick)="deleteRelationship(relationship)" [outlined]="true" [rounded]="true" label="Edit" severity="secondary" size="small" styleClass="delete-button"></p-button>-->
<!--              </td>-->
              <td>
                <p-button (onClick)="deleteRelationship(relationship)" [outlined]="true" [rounded]="true" label="Delete" severity="danger" size="small"  styleClass="delete-button"></p-button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-tabPanel>
    </p-tabView>

  `,
  styles: ``
})
export class RelationshipTableComponent {
  @Input() relationships: ConnProps[] = [];
  @Input() item!: Item;

  constructor(private editorService: EditorService, private eventService: EventService) {
  }

  get ingoingRelationships() {
    return this.relationships.filter(relationship => relationship.target === this.item.id.toString());
  }

  get outgoingRelationships() {
    return this.relationships.filter(relationship => relationship.source === this.item.id.toString());
  }

  deleteRelationship(relationship: ConnProps) {
    this.relationships.splice(this.relationships.indexOf(relationship), 1);
    this.editorService.deleteRelationship(relationship);
  }

  editRelationship(relationship: ConnProps) {
    this.eventService.publishEditorEvent(EditorEventType.SELECT_RELATIONSHIP, relationship);
  }


  showRelationship(relationship: ConnProps) {
    this.editorService.focusOnRelationship(relationship)
  }
}
