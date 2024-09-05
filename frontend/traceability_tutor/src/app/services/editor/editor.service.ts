import {ChangeDetectorRef, Injectable} from '@angular/core';
import {ClassicPreset, NodeEditor} from "rete";
import {AreaExtensions, AreaPlugin} from "rete-area-plugin";
import {structures} from "rete-structures";
import {concatMap, firstValueFrom, from, map, Observable, switchMap} from "rxjs";

import {
  ContentsDTO,
  CreateItemDTO, CreateIterationRequest,
  CreateRelationshipDTO, ImportFileParams,
  ItemDTO,
  ItemType,
  IterationDTO,
  ProjectDTO,
  RelationshipDTO,
  RelationshipType,
} from "../../../../gen/model";
import {Item, mapGenericModel, toItemDTO} from "../../models/itemMapper";
import {ItemNode} from "../../items/item-node";
import {ConnProps, ItemEventType, Schemes} from "../../types";
import {Project} from "../../models/project";
import {EventService} from "../event/event.service";
import {StateManager} from "../../models/state";
import {ProjectResourceService} from "../../../../gen/services/project-resource";
import {ItemResourceService} from "../../../../gen/services/item-resource";
import {Connection} from "../../connection";
import {AreaExtra, unselectAll} from "../../ui/editor/create-editor";
import {RelationshipResourceService} from "../../../../gen/services/relationship-resource";
import {GitHubResourceService} from "../../../../gen/services/git-hub-resource";
import {IterationResourceService} from "../../../../gen/services/iteration-resource";
import {GraphCycleValidator} from "../validation/cycleValidation";
const socket = new ClassicPreset.Socket('socket');

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  editor!: NodeEditor<Schemes>;
  area!: AreaPlugin<Schemes, AreaExtra>;
  arrange: any;
  private createItemType: ItemType | undefined;
  private cdr!: ChangeDetectorRef;

  constructor(
    private state: StateManager,
    private projectService: ProjectResourceService,
    private iterationService: IterationResourceService,
    private itemService: ItemResourceService,
    private relationshipService: RelationshipResourceService,
    private eventService: EventService,
    private githubService: GitHubResourceService,
  ) {
  }

  setChangeDetectorRef(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  setCreateItemType(itemType: ItemType) {
    this.createItemType = itemType;
  }

  getCreateItemType(): ItemType | undefined {
    return this.createItemType;
  }

  async addItem(item: ItemDTO) {
    const data = mapGenericModel(item);
    const lvlColor = this.getLevelColor(data);
    let node = new ItemNode(data);
    node.backgroundColor = lvlColor!;
    node.addOutput(node.id, new ClassicPreset.Output(socket, undefined, true));
    node.addInput(node.id, new ClassicPreset.Input(socket, undefined, true));
    // const existingNode = await this.editor.getNode(node.id);
    // if (existingNode) return;
    console.log(node.id);
    if (!await this.editor.addNode(node)) {
      throw new Error("Error while adding node");
    }

    await this.area.update('node', node.id);
  }

  async createItem(dto: CreateItemDTO) {
    console.log("createItemDTO", dto)
    this.itemService.createItem(dto).subscribe({
      next: async item => await this.addItem(item)
    });
  }

  editItem(item: Item) {
    console.log("item");
    const dto = toItemDTO(item);
    this.itemService.updateItem(item.id, dto).subscribe({
      next: async nodeId => {
        let node = this.editor.getNode(nodeId.toString());
        node.updateData({nodeData: item});
        this.eventService.publishItemEvent(ItemEventType.UPDATE_DATA, {id: Number(node.data.internalId), itemDTO: dto});
        await this.area.update('node', node.id);
        this.cdr.detectChanges();
        this.eventService.notify("Item was successfully updated.", 'success');
      }
    });
  }

  async addConnectionToEditor(relationship: RelationshipDTO) {
    try {
      const startItem = this.editor.getNode(relationship.startItemInternalId.toString());
      const endItem = this.editor.getNode(relationship.endItemInternalId.toString());

      if (!startItem || !endItem) {
        throw new Error(`Unable to find nodes for relationship: ${relationship.id}`);
      }
      console.assert(startItem.data.internalId.toString() == startItem.id);
      console.assert(endItem.data.internalId.toString() == endItem.id);
      console.log(startItem.id, endItem.id);

      const newConnection = new Connection(startItem, startItem.id, endItem, endItem.id, relationship);
      await this.editor.addConnection(newConnection);
    } catch (error) {
      console.error(`Error adding connection to editor for relationship ${relationship.id}:`, error);
      throw error; // Propagate the error to be handled in setupRelationshipsWithCodeItems
    }
  }

  async addConnectionsToEditor(relationships: RelationshipDTO[]) {
    await Promise.all(relationships.map(rel => this.addConnectionToEditor(rel)))
  }

  async createConnection(relationship: CreateRelationshipDTO) {
    this.relationshipService.createRelationship(relationship).subscribe({
      next: async result => {
        console.log("next connection", result);
        await this.addConnectionToEditor(result);
      }
    });
    setTimeout(() => this.arrangeNodes(), 500);
  }

  public loadProjectFromPath(params: any) {
    const projectId = Number(params.get('projectId'));
    if (projectId) {
      this.loadEditableItems(projectId).subscribe({
        next: async () => {
          this.loadEditableRelationships(projectId);
        }
      });
    } else {
      console.error('Project ID not found');
    }
  }

  public loadEditableItems(projectId: number): Observable<void> {
    return this.projectService.getProject(projectId).pipe(
      switchMap((projectDTO: ProjectDTO) => this.processProject(projectDTO, projectId)),
      concatMap(async ({project, items}) => {
        try {
          await this.addItems(items);
        } catch (error) {
          console.error('Failed to add items:', error);
          throw error;
        }
      })
    );
  }

  private processProject(projectDTO: ProjectDTO, projectId: number): Observable<{
    project: Project,
    items: ItemDTO[]
  }> {
    const project = new Project(projectDTO);
    return this.iterationService.getAllIterations({params: {projectId: projectId}}).pipe(
      map((releases: IterationDTO[]) => {
        releases.forEach(releaseDTO => {
          project.addIteration(releaseDTO);
        });
        return project;
      }),
      switchMap((project: Project) => {
        this.state.currentProject.set(project);
        return from(this.state.setCurrentProjectSettings(project)).pipe(
          switchMap(() => this.itemService.getProjectEditableItems(project.id)),
          map((items: ItemDTO[]) => ({project, items}))
        );
      }),
    );
  }

  public loadEditableRelationships(projectId: number): void {
    this.relationshipService.getProjectEditableRelationships(projectId).pipe().subscribe({
      next: async (relationships: RelationshipDTO[]) => {
        for (const relationship of relationships) {
          await this.addConnectionToEditor(relationship);
        }
        await this.arrangeNodes();
      },
      error: (error) => {
        console.error('Failed to load relationships:', error);
      }
    });
  }

  async arrangeNodes(): Promise<void> {
    await this.arrange.layout({
      options: {
        'elk.spacing.nodeNode': 200,
        'elk.layered.spacing.nodeNodeBetweenLayers': 200,
        'elk.alignment': 'RIGHT',
        'elk.layered.nodePlacement.strategy': 'LINEAR_SEGMENTS',
        'elk.direction': 'RIGHT',
        'elk.edge.type': 'DIRECTED',
        'elk.radial.centerOnRoot': true,
        'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
      },
    });
    await AreaExtensions.zoomAt(this.area, this.editor.getNodes());
  }

  public async addItems(items: ItemDTO[]): Promise<void> {
    try {
      // Use a Set to ensure uniqueness based on item ID
      const uniqueItems = new Set(items.map(item => JSON.stringify(item)));

      await Promise.all([...uniqueItems].map(async itemString => {
        const item = JSON.parse(itemString);
        try {
          const existingNode = this.editor.getNode(item.id.toString());
          if (!existingNode) {
            await this.addItem(item);
            console.log(`Added item: ${item.id}`);
          } else {
            console.log(`Item ${item.id} already exists, skipping`);
          }
        } catch (error) {
          console.error('Error adding item:', error);
        }
      }));
    } catch (error) {
      console.error('Error in addItems:', error);
    }
  }

  private async setupCodeItems(updatedItems: ItemDTO[] | undefined) {
    try {
      console.log('Starting setupCodeItems');

      // Get all existing nodes
      const existingNodes = this.editor.getNodes();
      console.log(`Existing nodes before deletion: ${JSON.stringify(existingNodes.map(n => n.id))}`);

      // Delete existing CODE items
      await this.deleteItemsByConditionFromEditor(item => item.itemType === ItemType.CODE);

      // Add a small delay to ensure editor state is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check nodes after deletion
      const nodesAfterDeletion = this.editor.getNodes();
      console.log(`Existing nodes after deletion: ${JSON.stringify(nodesAfterDeletion.map(n => n.id))}`);

      if (updatedItems && updatedItems.length > 0) {
        console.log(`Adding ${updatedItems.length} new items`);
        for (const item of updatedItems) {
          await this.addItemSafely(item);
        }
      } else {
        console.log('No new items to add');
      }

      console.log('Finished setupCodeItems');
    } catch (error) {
      console.error('Error in setupCodeItems:', error);
      throw error;
    }
  }

  private async addItemSafely(item: ItemDTO) {
    try {
      // Generate a new unique ID for the node
      const newId = item.id.toString();
      console.log(`Attempting to add item with new ID: ${newId}`);

      const existingNode = this.editor.getNode(newId);
      if (existingNode) {
        console.log(`Node with ID ${newId} already exists, skipping`);
        return;
      }

      const data = mapGenericModel(item);
      const lvlColor = this.getLevelColor(data);
      let node = new ItemNode(data);
      node.id = newId;  // Set the new ID
      node.backgroundColor = lvlColor!;
      node.addOutput(newId, new ClassicPreset.Output(socket, undefined, true));
      node.addInput(newId, new ClassicPreset.Input(socket, undefined, true));

      const addResult = await this.editor.addNode(node);
      if (!addResult) {
        throw new Error(`Failed to add node ${newId} to editor`);
      }

      await this.area.update('node', newId);
      console.log(`Successfully added item with ID: ${newId}`);
    } catch (error) {
      console.error(`Error adding item ${item.id}:`, error);
      console.log('Current editor nodes:', JSON.stringify(this.editor.getNodes().map(n => n.id)));
    }
  }

  private async deleteItemsByConditionFromEditor(predicate: (item: Item) => boolean) {
    const graph = structures(this.editor);
    let nodesToDelete = graph.filter(node => predicate(node.data)).nodes();
    console.log(`Deleting ${nodesToDelete.length} nodes`);
    for (const nodeToDelete of nodesToDelete) {
      try {
        await this.editor.removeNode(nodeToDelete.id);
        await this.area.update('node', nodeToDelete.id);
        console.log(`Deleted node: ${nodeToDelete.id}`);
      } catch (error) {
        console.error(`Error deleting node ${nodeToDelete.id}:`, error);
      }
    }
    console.log('Finished deleting nodes');
  }

  async fetchCodeItems() {
    const projectId = this.state.currentProject()?.id!;

    try {
      console.log('Starting fetchCodeItems');
      const result = await firstValueFrom(this.githubService.codeItems(projectId));

      await this.setupCodeItems(result.updatedItems);
      await this.setupRelationshipsWithCodeItems(result.newRelationships);

      if (result.unmappedInternalIds && result.unmappedInternalIds.length > 0) {
        const message = "Internal IDs mentioned in commits, but corresponding requirements not found: \n"
          + result.unmappedInternalIds.join(", ");
        this.eventService.notify(message, "warning", "Mapping error");
      }

      console.log('Arranging nodes');
      await this.arrangeNodes();
      console.log('Finished fetchCodeItems');
    } catch (error) {
      //console.error('Error in fetchCodeItems:', error);
      //this.eventService.notify("An error occurred while fetching code items. The page will refresh.", "error");
      window.location.reload();
    }
  }

  applyPipes(editor: NodeEditor<Schemes>): void {
    editor.addPipe(async (c) => {
      if (c.type === 'connectioncreate') {
        // Cycle check logic can be uncommented if needed
      }
      return c;
    });
    this.area.addPipe(async (c) => {
      if (c.type === 'pointerdown') {
        const graph = structures(editor);
        await unselectAll(graph);
      }
      return c;
    });
  }

  getRelationshipsData(item: Item): RelationshipDTO[] {
    return this.editor.getConnections()
      .filter(connection => this.isConnectionRelatedToItem(connection, item))
      .map(connection => connection.data as RelationshipDTO);
  }

  getRelationships(item: Item): ConnProps[] {
    return this.editor.getConnections()
      .filter(connection => this.isConnectionRelatedToItem(connection, item));
  }

  private isConnectionRelatedToItem(connection: ConnProps, item: Item): boolean {
    return connection.source === item.internalId.toString() || connection.target === item.internalId.toString();
  }

  relationshipExists(startItemId: string, endItemId: string): boolean {
    return this.editor.getConnections().some(connection =>
      connection.source === startItemId && connection.target === endItemId
    );
  }

  getLevelColor(item: Item): string | undefined {
    return this.state.currentProject()?.levels.get(item.data['level'])?.color;
  }

  getLevelName(item: Item): string | undefined {
    return this.state.currentProject()?.levels.get(item.data['level'].toLowerCase())?.color;
  }

  public exportEditorContents(): void {
    const exportData = this.prepareExportData();
    this.downloadExportData(exportData);
  }

  public importEditorContents(file: File) {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        const params: ImportFileParams = { id: Number(this.state.currentProject()?.id) };

        this.projectService.importFile<ContentsDTO>(fileContent, params).subscribe({
          next: (result) => observer.next(result),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      };
      reader.onerror = (error) => observer.error(error);
      reader.readAsText(file);
    });
  }

  private prepareExportData() {
    let nodesData = this.editor.getNodes()
      .map(node => (node as ItemNode).data);

    let connectionData = this.editor.getConnections().map(connection => {
      return connection.data
    });
    let projectConfiguration = this.state.currentProject()?.toDto();
    return {items: nodesData, relationships: connectionData, project: projectConfiguration};
  }

  private downloadExportData(exportData: any) {
    const jsonString = JSON.stringify(exportData, null, 4);
    const blob = new Blob([jsonString], {type: 'application/json'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.state.currentProject()?.name}-${new Date().toISOString()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  public async notCreateCycle(startItem: number, endItem: number): Promise<boolean> {
    const tempConnection = await this.addConnectionForCheck(startItem, endItem);
    const graphCycleDetector = new GraphCycleValidator(this.editor);

    const cycleDetected = graphCycleDetector.isCyclic();
    await this.editor.removeConnection(tempConnection);

    return !cycleDetected;
  }

  private async addConnectionForCheck(startItemId: number, endItemId: number) {
    const startItem = this.editor.getNode(startItemId.toString());
    const endItem = this.editor.getNode(endItemId.toString());
    const relationship: CreateRelationshipDTO = {
      startItemInternalId: startItemId,
      endItemInternalId: endItemId,
      type: RelationshipType.DERIVES,
      description: 'Temporary connection for cycle check'
    };
    const newConnection = new Connection(startItem, startItem.id, endItem, endItem.id, relationship);
    await this.editor.addConnection(newConnection);
    return newConnection.id;
  }

  public async focusOnNode(nodeId: string): Promise<void> {
    const graph = structures(this.editor);
    await AreaExtensions.zoomAt(this.area, graph.nodes().filter(n => n.id === nodeId), {scale: 0.1});
    await this.translateFromSidebar();
  }

  private async translateFromSidebar(): Promise<void> {
    const {x, y} = this.area.area.transform;
    await this.area.area.translate(x - 300, y);
  }

  public focusOnRelationship(relationship: ConnProps): void {
    const graph = structures(this.editor);
    unselectAll(graph);
    relationship.updateData({selected: true});
    AreaExtensions.zoomAt(this.area, graph.nodes().filter(n => n.id === relationship.source || n.id === relationship.target), {scale: 0.4});
    this.translateFromSidebar();
  }

  public deleteRelationship(relationship: ConnProps): void {
    this.relationshipService.deleteRelationship((relationship.data as RelationshipDTO).id).subscribe({
      next: async () => {
        await this.editor.removeConnection(relationship.id);
      },
      error: (err) => this.eventService.notify(err.error.message, 'error')
    });
  }

  public getStatuses(itemType: ItemType): string[] {
    const statusMap = {
      [ItemType.REQUIREMENT]: ['Open', 'Closed', 'TBD'],
      [ItemType.CODE]: ['Open', 'Tested', 'Closed'],
      [ItemType.TEST]: ['Planned', 'Completed', 'Failed'],
      [ItemType.DESIGN]: ['Open', 'Implemented', 'Closed'],
    };
    return (statusMap[itemType] || []).map(s => s.toUpperCase());
  }

  public getLevelNames(itemType: ItemType): string[] {
    let levels = this.state.currentProject()?.levels;
    const excludedLevels = ['Code', 'Design', 'Test'];

    if (itemType === ItemType.REQUIREMENT) {
      return Array.from(levels!.keys())
        .filter(levelName => !excludedLevels.includes(levelName));
    }

    const levelMap = {
      [ItemType.CODE]: ['Code'],
      [ItemType.DESIGN]: ['Design'],
      [ItemType.TEST]: ['Test'],
    };

    return levelMap[itemType] || [];
  }

  async updateRelationship(changedData: CreateRelationshipDTO) {
    const existing = this.editor.getConnections().find(conn =>
      conn.source === changedData.startItemInternalId.toString() && conn.target === changedData.endItemInternalId.toString()
    );
    if (existing) {
      this.updateExistingRelationship(existing, changedData);
    }
  }

  private updateExistingRelationship(existing: ConnProps, changedData: CreateRelationshipDTO) {
    const data = existing.data as RelationshipDTO;
    Object.assign(data, changedData);
    this.relationshipService.updateRelationship(data.id, data).subscribe({
      next: async result => {
        await this.editor.removeConnection(existing.id);
        existing.updateData(result);
        const source = this.editor.getNode(existing.source);
        const target = this.editor.getNode(existing.target);
        await this.editor.addConnection(
          new Connection(source, existing.sourceOutput, target, existing.targetInput, result)
        );
      }
    });
  }

  itemsExist(startItem: string, endItem: string): boolean {
    try {
      const start = this.editor.getNode(startItem);
      const end = this.editor.getNode(endItem);
      return (start !== undefined) && (end !== undefined);
    } catch (e) {
      return false;
    }
  }

  async deleteItemWithConnections(payload: { item: string, itemDataId: string, relationships: number[] }) {
    await this.deleteItemWithAllConnections(payload.item, payload.itemDataId);
  }

  async deleteItemWithAllConnections(itemId: string, itemDataId: string) {

    this.itemService.deleteItem(Number(itemDataId)).subscribe({
      next: () => {
        this.editor.removeNode(itemId).then(() => {
          this.area.update('node', itemId);

          const graph = structures(this.editor);
          const allConnections = graph.connections().filter(relationship =>
              relationship.source === itemId || relationship.target === itemId
          );

          allConnections.forEach(conn => {
            this.editor.removeConnection(conn.id).then(() => {
              this.area.update('connection', conn.id);
            });
          });

          //this.eventService.notify(`Item #${itemId} with its adjacent edges was deleted successfully`, 'success');
        });
      },
      error: (error) => {
        console.error('Error deleting item from database:', error);
        this.eventService.notify(`Error deleting item #${itemId} from database`, 'error');
      }
    });
  }

  // /**
  //  * fixme somewhere here there is an error that occurs on this.arrangeNodes - editor tries to move non existing inputs.
  //  * it may be caused because area.update was not triggered at important place
  //  * more info here: https://retejs.org/docs/faq#force-update
  //  */
  // async fetchCodeItems() {
  //   const projectId = this.state.currentProject?.id!;
  //
  //   try {
  //     const result = await firstValueFrom(this.githubService.codeItems(projectId));
  //
  //     await this.setupCodeItems(result.updatedItems);
  //     await this.setupRelationshipsWithCodeItems(result.newRelationships);
  //
  //     if (result.unmappedInternalIds && result.unmappedInternalIds.length > 0) {
  //       const message = "Internal IDs mentioned in commits, but corresponding requirements not found: \n"
  //         + result.unmappedInternalIds.join(", ");
  //       this.eventService.notify(message, "warning", "Mapping error");
  //     }
  //
  //     await this.arrangeNodes();
  //   } catch (error) {
  //     console.error('Error in fetchCodeItems:', error);
  //     this.eventService.notify("An error occurred while fetching code items. The page will refresh.", "error");
  //     window.location.reload();
  //   }
  // }

  private async setupRelationshipsWithCodeItems(newRelationships: RelationshipDTO[] | undefined) {
    try {
      const graph = structures(this.editor);
      const existingCodeItemIds = graph.filter(node => node.data.itemType === ItemType.CODE).nodes().map(n => n.id);

      await this.deleteFromEditorRelationshipsByCondition(relationship =>
        existingCodeItemIds.includes(relationship.startItemInternalId.toString()) ||
        existingCodeItemIds.includes(relationship.endItemInternalId.toString())
      );

      if (newRelationships && newRelationships.length > 0) {
        await Promise.all(newRelationships.map(rel => this.addConnectionToEditor(rel)));
      }
    } catch (error) {
      console.error('Error in setupRelationshipsWithCodeItems:', error);
      throw error; // Propagate the error to be handled in fetchCodeItems
    }
  }



  private async deleteFromEditorRelationshipsByCondition(predicate: (relationship: RelationshipDTO) => boolean) {
    const graph = structures(this.editor);
    let connectionsToDelete = graph.connections().filter(conn => predicate(conn.data as RelationshipDTO));
    for (const connectionToDelete of connectionsToDelete) {
      await this.editor.removeConnection(connectionToDelete.id);
      await this.area.update('connection', connectionToDelete.id);
    }
  }

  saveIteration() {
    const graph = structures(this.editor);
    const nodeIds = graph.nodes().map(n => Number(n.id));
    const relationshipIds = graph.connections().map(c => Number(c.id));
    const req: CreateIterationRequest = {projectId: this.state.currentProject()?.id,
                                                  itemIds: nodeIds,
                                                  relationshipIds: relationshipIds}
    this.iterationService.createIteration(req).subscribe(
        {
          next: (iteration: IterationDTO) => {
            const project = this.state.currentProject();
            if (project) {
              project.addIteration(iteration);
              this.state.currentProject.set(project);
            }
    },
          error: err => {
            console.log(err);
          }
        }
    )


  }
}
