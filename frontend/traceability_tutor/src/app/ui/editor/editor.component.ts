import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

import {ClassicPreset, NodeEditor} from 'rete';
import {BaseEvent, EditorEventType, EventSource, Schemes} from '../../types';
import {ItemNode} from '../../items/item-node';
import {EventService} from 'src/app/services/event/event.service';
import {ActivatedRoute, Router} from "@angular/router";
import {createEditor} from "./create-editor";
import {ItemType} from "../../../../gen/model";
import {EditorService} from "../../services/editor/editor.service";
import {Subscription} from "rxjs";
import {DockManager} from "../dock/dock-manager";
import {constructCreateItemDTO, Item} from "../../models/itemMapper";

const socket = new ClassicPreset.Socket('socket');

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('rete') container!: ElementRef<HTMLElement>;
  editor!: NodeEditor<Schemes>;
  sidebarVisible = false;
  openedItem!: Item;
  loading = false;
  sideViewInitialized = false;
  createItemVisible = false;
  firstSelectedItem: ItemNode | null = null;
  //relationship crud
  createRelationshipVisible = false;
  createConnectionPair: {
    startItem: string,
    endItem: string
  } | undefined;
  protected readonly ItemType = ItemType;
  private destroyEditor: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private injector: Injector,
    private route: ActivatedRoute,
    private eventService: EventService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public editorService: EditorService,
    private dockManager: DockManager
  ) {}

  get statuses(): string[] {
    return this.editorService.getStatuses(this.editorService.getCreateItemType()!);
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.eventService.event$.subscribe(async (event: BaseEvent<EventSource, EditorEventType>) => {
        console.log('Event received:', event);
        if (event.source === EventSource.EDITOR) {
          await this.handleEditorEvent(event);
        } else if (event.source === EventSource.ITEM_VIEW) {
          // Handle ITEM_VIEW events if necessary
        }
      })
    );
  }

  ngAfterViewInit(): void {
    const el = this.container.nativeElement;
    if (el) {
      this.loading = true;
      createEditor(el, this.injector, this.eventService).then(({destroy, editor, area, arrange}) => {
        this.destroyEditor = destroy;
        this.editor = editor;
        this.editorService.editor = editor;
        this.editorService.area = area;
        this.editorService.arrange = arrange;
        this.subscriptions.add(
          this.route.paramMap.subscribe(params => {
            this.editorService.loadProjectFromPath(params);
          })
        );
        this.editorService.applyPipes(editor);
        this.loading = false;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.destroyEditor) {
      this.destroyEditor();
    }
    this.subscriptions.unsubscribe();
  }

  onItemInfoViewToggleVisible(visible: boolean): void {
    this.sidebarVisible = visible;
  }

  onItemViewInitialized(): void {
    this.sideViewInitialized = true;
    this.loading = false;
    this.cdr.detectChanges();
  }

  async onItemCreate($event: any) {
    console.log($event, 'this is  event');
    const newItem = constructCreateItemDTO($event);
    console.log('dto', newItem);
    await this.editorService.createItem(newItem);
  }

  private async handleEditorEvent(event: BaseEvent<EventSource, EditorEventType>): Promise<void> {
    console.log('Handling editor event:', event);
    switch (event.type) {
      case EditorEventType.ADD_ITEM:
        this.createItemVisible = true;
        break;
      case EditorEventType.ADD_RELATIONSHIP:
        this.handleAddConnectionEvent(event.payload);
        break;
      case EditorEventType.ADD_RELATIONSHIP_SELECT_SOURCE:
        this.handleSelectSource(event.payload);
        break;
      case EditorEventType.SELECT_ITEM:
        this.handleSelectItemEvent(event.payload);
        break;
      case EditorEventType.CLEAR:
        await this.editor.clear();
        break;
      case EditorEventType.TO_PROJECTS_MENU:
        await this.router.navigateByUrl('/projects');
        break;
      case EditorEventType.EXPORT:
        this.editorService.exportEditorContents();
        break;
      case EditorEventType.CHOOSE_SECOND_ITEM:
        await this.handleSecondItemSelection(event.payload);
        break;
      case EditorEventType.REARRANGE:
        await this.editorService.arrangeNodes();
        break;
      case EditorEventType.REMOVE_ITEM:
        await this.editorService.deleteItemWithConnections(event.payload);
        break;
    }
  }

  private handleAddConnectionEvent(payload?: any): void {
    if (payload?.firstItem) {
      this.eventService.notify("Select the second node to establish the relationship", 'info', '', {disableTimeOut: true});
      this.firstSelectedItem = payload.item;
      this.dockManager.addMenuItem({
        label: 'Cancel adding relationship',
        command: () => {
          this.cancelAddRelationship();
        }
      });
    } else {
      this.createRelationshipVisible = true;
    }
  }

  private async handleSecondItemSelection(payload: any): Promise<void> {
    console.log('Handling second item selection:', payload);
      const secondItem: ItemNode = payload.item;
      const firstItem = this.firstSelectedItem;
      if (firstItem && secondItem) {
        const id1 = firstItem.id;
        const id2 = secondItem.id;
        this.createConnectionPair = {startItem: firstItem.id, endItem: secondItem.id};
        this.eventService.clearToasts();
        const exists = this.editorService.relationshipExists(id1, id2);
        if (exists) {
          this.eventService.notify('Relationship between selected items already exists.', 'warning', '', {timeOut: 5000});
        } else {
          const willNotCreateCycle = await this.editorService.notCreateCycle(Number(id1), Number(id2));
          if (!willNotCreateCycle) {
            this.eventService.notify('Relationship with selected items would create a cycle.', 'error', '', {timeOut: 5000});
          } else {
            this.eventService.publishEditorEvent(EditorEventType.ADD_RELATIONSHIP, this.createConnectionPair);
          }
        this.cancelAddRelationship();
        secondItem.updateData({selected: false});
        firstItem.updateData({selected: false});
      }
    }
  }

  private handleSelectItemEvent(item: ItemNode): void {
    item.updateData({selected: true});
    this.openedItem = item.data;
    setTimeout(() => {
      this.sidebarVisible = true;
    }, 300);
  }

  private cancelAddRelationship(): void {
    this.firstSelectedItem = null;
    this.eventService.clearToasts();
    this.dockManager.removeMenuItem("Cancel adding relationship");
  }

  private handleSelectSource(payload: any) {
    if (payload.firstItem) {
      this.eventService.notify("Select the second node to establish the relationship", 'info', '', {disableTimeOut: true});
      this.firstSelectedItem = payload.item;
      this.dockManager.addMenuItem({
        label: 'Cancel adding relationship',
        command: () => {
          this.cancelAddRelationship();
        }
      });
    } else {
      this.createRelationshipVisible = true;
    }
  }
}
