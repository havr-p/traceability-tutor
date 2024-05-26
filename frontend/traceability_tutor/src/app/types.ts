import {ClassicPreset, GetSchemes} from 'rete';
import {Connection} from './connection';
import {ItemNode} from './items/item-node';

export type ItemProps =
// | DebugChat
// | Message
// | OnMessage
// | MatchMessage
    ItemNode;
export type ConnProps = Connection<ItemProps, ItemProps>
// | Connection<MatchMessage, SendMessage>
// | Connection<OnMessage, MatchMessage>;

export type Schemes = GetSchemes<ItemProps, ConnProps>;

export enum EditorEventType {
    ADD_ITEM = 'add item',
    ADD_RELATIONSHIP = 'add relationship',
    ADD_RELATIONSHIP_SELECT_SOURCE = 'add relationship select source',
    REMOVE_ITEM = 'remove',
    EDIT = 'edit',
    SELECT_ITEM = 'select item',
    SELECT_RELATIONSHIP = 'select relationship',
    LOAD = 'load',
    DEMO = 'demo',
    EXPORT = 'export',
    IMPORT = 'import',
    CLEAR = 'clear',
    TO_PROJECTS_MENU = 'to projects menu',
    SAVE_ITERATION = 'save iteration',
    CHOOSE_SECOND_ITEM = 'choose second item',
    REARRANGE = 'rearrange',
}

export enum ProjectEventType {
    CREATE = 'create',
    REMOVE = 'remove',
    EDIT = 'edit',
    SELECT = 'select',
    SETUP_DEMO = "setup demo",
}

export enum ItemViewEventType {
    EDIT = 'edit',
}

export enum EventSource {
    EDITOR = 'editor',
    ITEM_VIEW = 'item view',
    PROJECT_MENU = 'project menu'
}

export abstract class BaseEvent<S extends EventSource, U> {
    protected constructor(
        public source: S,
        public type: U,
        public payload: any,
    ) {
    }
}

export class EditorEvent extends BaseEvent<
    EventSource.EDITOR,
    EditorEventType
> {
    constructor(type: EditorEventType, payload: any) {
        super(EventSource.EDITOR, type, payload);
    }
}

export class ItemViewEvent extends BaseEvent<
    EventSource.ITEM_VIEW,
    ItemViewEventType
> {
    constructor(type: ItemViewEventType, payload: any) {
        super(EventSource.ITEM_VIEW, type, payload);
    }
}

export class ProjectEvent extends BaseEvent<
    EventSource.PROJECT_MENU,
    ProjectEventType
> {
    constructor(type: ProjectEventType, payload: any) {
        super(EventSource.PROJECT_MENU, type, payload);
    }
}


