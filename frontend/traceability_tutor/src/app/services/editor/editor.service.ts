import {ChangeDetectorRef, Injectable, Injector} from '@angular/core';
import {ClassicPreset, NodeEditor} from "rete";
import {
    CreateItemDTO,
    CreateRelationshipDTO,
    ItemDTO, ItemType,
    ProjectDTO,
    RelationshipDTO,
    RelationshipType,
    ReleaseDTO
} from "../../../../gen/model";
import {Item, mapGenericModel} from "../../models/itemMapper";
import {ItemNode} from "../../items/item-node";
import {ConnProps, ItemProps, Schemes} from "../../types";
import {concatMap, from, map, Observable, switchMap} from "rxjs";
import {Project} from "../../models/project";
import {Release} from "../../models/release";
import {ActivatedRoute, Router} from "@angular/router";
import {EventService} from "../event/event.service";
import {StateManager} from "../../models/state";
import {ProjectResourceService} from "../../../../gen/services/project-resource";
import {ReleaseResourceService} from "../../../../gen/services/release-resource";
import {ItemResourceService} from "../../../../gen/services/item-resource";
import {Connection} from "../../connection";
import {AreaExtensions} from "rete-area-plugin";
import {structures} from "rete-structures";
import {GraphCycleDetector} from "../../ui/editor/cycleValidation";
import {unselectAll} from "../../ui/editor/create-editor";
import {RelationshipResourceService} from "../../../../gen/services/relationship-resource";
import {ReadonlyPlugin} from "rete-readonly-plugin";

const socket = new ClassicPreset.Socket('socket');

export type RequestConnectionDataCallback = () => Promise<any>;

@Injectable({
    providedIn: 'root'
})
export class EditorService {
    editor!: NodeEditor<Schemes>;
    area: any;
    arrange: any;
    private createItemType: ItemType | undefined;

    constructor(
        private state: StateManager,
        private projectService: ProjectResourceService,
        private releaseService: ReleaseResourceService,
        private itemService: ItemResourceService,
        private relationshipService: RelationshipResourceService,
        private eventService: EventService,
    ) {}

    setCreateItemType(itemType: ItemType) {
        this.createItemType = itemType;
    }

    getCreateItemType(): ItemType | undefined {
        return this.createItemType;
    }

    async addLoadedItem(item: ItemDTO) {
        const data = mapGenericModel(item);
        const lvlColor = this.getLevelColor(item);
        let node = new ItemNode(data);
        node.backgroundColor = lvlColor!;
        node.addOutput(node.id, new ClassicPreset.Output(socket, undefined, true));
        node.addInput(node.id, new ClassicPreset.Input(socket, undefined, true));
        if (!this.editor.addNode(node)) throw new Error("Error while adding node");
    }

    async createItem(dto: CreateItemDTO) {
        console.log("in service")
        const newItem = this.itemService.createItem(dto).subscribe({
            next: item => this.addLoadedItem(item)
        })
    }

    async addConnectionToEditor(relationship: RelationshipDTO) {
        const startItem = this.editor.getNode(relationship.startItem.toString());
        const endItem = this.editor.getNode(relationship.endItem.toString());
        await this.editor.addConnection(
            new Connection(startItem, startItem.id, endItem, endItem.id, relationship)
        );
    }

    async createConnection(relationship: CreateRelationshipDTO) {
        const startItem = this.editor.getNode(relationship.startItem.toString());
        const endItem = this.editor.getNode(relationship.endItem.toString());
        this.relationshipService.createRelationship(relationship).subscribe({
            next: async result => {
                await this.editor.addConnection(
                    new Connection(startItem, startItem.id, endItem, endItem.id, result)
                );
            }
        });
    }

    private async addConnectionForCheck(startItemId: number, endItemId: number) {
        const startItem = this.editor.getNode(startItemId.toString());
        const endItem = this.editor.getNode(endItemId.toString());
        const relationship: CreateRelationshipDTO = {
            startItem: startItemId,
            endItem: endItemId,
            type: RelationshipType.DERIVES,
            description: 'Temporary connection for cycle check'
        };
        const newConnection = new Connection(startItem, startItem.id, endItem, endItem.id, relationship);
        await this.editor.addConnection(newConnection);
        return newConnection.id;
    }

    public loadProjectFromPath(params: any) {
        const projectId = Number(params.get('projectId'));
        if (projectId) {
            this.loadEditableItems(projectId).subscribe({
                next: async () => {
                    this.loadEditableRelationships(projectId);
                }
            })
        } else {
            console.error('Project ID not found');
        }
    }

    public loadEditableItems(projectId: number): Observable<void> {
        return this.projectService.getProject(projectId).pipe(
            switchMap((projectDTO: ProjectDTO) => {
                const project = new Project(projectDTO);
                return this.releaseService.getAllReleases({ params: { projectId: projectId } }).pipe(
                    map((releases: ReleaseDTO[]) => {
                        releases.forEach(releaseDTO => {
                            const release = new Release(releaseDTO);
                            project.addRelease(release);
                        });
                        return project;
                    }),
                    switchMap((project: Project) => {
                        this.state.currentProject = project;
                        return this.itemService.getProjectEditableItems(project.id).pipe(
                            map((items: ItemDTO[]) => ({ project, items }))
                        );
                    }),
                );
            }),
            concatMap(async ({ project, items }) => {
                console.log('Project with editable items:', project, items);
                try {
                    await this.addItems(items);
                    console.log('Items added successfully');
                } catch (error) {
                    console.error('Failed to add items:', error);
                    throw error;
                }
            })
        );
    }

    public loadEditableRelationships(projectId: number): void {
        console.log('nodes', this.editor.getNodes());
        this.relationshipService.getProjectEditableRelationships(projectId).pipe().subscribe({
            next: async (relationships: RelationshipDTO[]) => {
                console.log('Editable relationships:', relationships);
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
                'elk.spacing.nodeNode': 100,
                'elk.layered.spacing.nodeNodeBetweenLayers': 300,
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
        for (const item of items) {
            try {
                await this.addLoadedItem(item);
            } catch (error) {
                console.error('Error adding item:', error);
            }
        }
    }

    applyPipes(editor: NodeEditor<Schemes>): void {
        editor.addPipe(async (c) => {
            if (c.type === 'connectioncreate') {
                const connection = c.data;
                // Uncomment to check for cycle
                // if (await this.notCreateCycle(Number(connection.source), Number(connection.target))) {
                //     alert("Connection caused cycle, now removed.");
                //     return;
                // }
            }
            return c;
        });
        this.area.addPipe((c: { type: string; }) => {
            if (c.type === 'pointerdown') {
                const graph = structures(editor);
                unselectAll(graph);
            }
            return c;
        });
    }

    getRelationshipsData(item: Item): RelationshipDTO[] {
        return this.editor.getConnections().filter(connection =>
            connection.source === item.id.toString() || connection.target === item.id.toString()
        ).map(connection => connection.data as RelationshipDTO);
    }

    getRelationships(item: Item): ConnProps[] {
        return this.editor.getConnections().filter(connection =>
            connection.source === item.id.toString() || connection.target === item.id.toString()
        );
    }

    relationshipExists(startItemId: string, endItemId: string): boolean {
        return this.editor.getConnections().some(connection => connection.source === startItemId && connection.target === endItemId);
    }

    getLevelColor(item: ItemDTO): string | undefined {
        return this.state.currentProject?.levels.find(lvl => lvl.name.toLowerCase() === item.data['level'].toLowerCase())?.color;
    }

    getLevelName(item: Item): string | undefined {
      return this.state.currentProject?.levels.find(lvl => lvl.name.toLowerCase() === item.data['level'].toUpperCase())?.name;
    }

    getLevelColorByName(level: string | "Design" | "Code" | "Test" | undefined): string | undefined {
        return this.state.currentProject?.levels.find(lvl => lvl.name.toLowerCase() === level!.toLowerCase())?.color;
    }

    public exportEditorContents(): void {
        let nodesData = [];
        let connectionData = [];

        for (const node of this.editor.getNodes()) {
            if (node instanceof ItemNode) {
                nodesData.push(node.data);
            }
        }

        for (const connection of this.editor.getConnections()) {
            connectionData.push({
                startItem: Number(connection.source),
                endItem: Number(connection.target),
                description: connection.data.description,
            });
        }

        const exportData = {
            items: nodesData,
            relationships: connectionData
        };

        const jsonString = JSON.stringify(exportData, null, 4);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'tt-snapshot-' + new Date().toISOString() + '.json';
        a.click();

        URL.revokeObjectURL(url);
    }

    public async notCreateCycle(startItem: number, endItem: number): Promise<boolean> {
        const tempConnection = await this.addConnectionForCheck(startItem, endItem);
        const graph = structures(this.editor);
        const graphCycleDetector = new GraphCycleDetector(graph);

        const cycleDetected = graphCycleDetector.isCyclic();
        await this.editor.removeConnection(tempConnection);

        return !cycleDetected;
    }

    public async focusOnNode(nodeId: string): Promise<void> {
        const graph = structures(this.editor);
        AreaExtensions.zoomAt(this.area, graph.nodes().filter(n => n.id === nodeId), { scale: 0.1 });
        await this.translateFromSidebar();
    }

    private async translateFromSidebar(): Promise<void> {
        const { x, y } = this.area.area.transform;
        await this.area.area.translate(x - 300, y);
    }

    public focusOnRelationship(relationship: ConnProps): void {
        console.log(relationship);
        const graph = structures(this.editor);
        unselectAll(graph);
        relationship.updateData({ selected: true });
        AreaExtensions.zoomAt(this.area, graph.nodes().filter(n => n.id === relationship.source || n.id === relationship.target), { scale: 0.4 });
        this.translateFromSidebar();
    }

    public deleteRelationship(relationship: ConnProps): void {
        this.relationshipService.deleteRelationship((relationship.data as RelationshipDTO).id).subscribe({
            next: async value => {
                await this.editor.removeConnection(relationship.id);
            },
            error: (err) => this.eventService.notify(err.error.message, 'error')
        });
    }

    public getStatuses(itemType: ItemType): string[] {
        switch (itemType) {
            case ItemType.REQUIREMENT:
                return ['Open', 'Closed', 'TBD'];
            case ItemType.CODE:
                return ['Open', 'Tested', 'Closed'];
            case ItemType.TEST:
                return ['Planned', 'Completed', 'Failed'];
            case ItemType.DESIGN:
                return ['Open', 'Implemented', 'Closed'];
            default:
                return [];
        }
    }

    public getLevelNames(itemType: ItemType): string[] {
        let levels = this.state.currentProject?.levels;
        switch (itemType) {
            case ItemType.REQUIREMENT:
                return levels?.filter(level => !['Code', 'Design', 'Test'].includes(level.name)).map(level => level.name) ?? [];
            case ItemType.CODE:
                return ['Code'];
            case ItemType.DESIGN:
                return ['Design'];
            case ItemType.TEST:
                return ['Test'];
        }
    }

    async updateRelationship(changedData: CreateRelationshipDTO) {
        const existing = this.editor.getConnections().find(conn =>
            conn.source === changedData.startItem.toString() && conn.target === changedData.endItem.toString()
        );
        if (existing) {
            const data = existing.data as RelationshipDTO;
            data.type = changedData.type;
            data.endItem = changedData.endItem;
            data.startItem = changedData.startItem;
            data.description = changedData.description;
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
    }

    itemsExist(startItem: string, endItem: string): boolean {
      try {
          const start = this.editor.getNode(startItem);
          const end = this.editor.getNode(endItem);
          return ((start != undefined) && (end != undefined));
      } catch (e) {
          return false
      }
    }

    async deleteItemWithConnections(payload: {item: string, relationships: number[]}) {
        console.log(payload)
        from(this.editor.removeNode(payload.item)).pipe(
            concatMap(() => from(payload.relationships).pipe(
                concatMap(conn => from(this.editor.removeConnection(conn.toString())).pipe(
                    concatMap(() => from(this.relationshipService.deleteRelationship(conn)))
                )),
                concatMap(() => from(this.itemService.deleteItem(Number(payload.item)))),
            ))
        ).subscribe({
            complete: () => this.eventService.notify("Item " + payload.item + " with its adjacent edges was deleted successfully", 'success')
        });

    }
}
