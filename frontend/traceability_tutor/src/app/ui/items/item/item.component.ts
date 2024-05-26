import {
    ChangeDetectorRef,
    Component,
    HostBinding,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import {ItemNode} from '../../../items/item-node';
import {EventService} from '../../../services/event/event.service';
import {EditorEventType} from "../../../types";

@Component({
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.sass'],
    host: {
        'data-testid': 'node',
    },
})
export class ItemComponent implements OnChanges, OnInit {
    @Input() data!: ItemNode;
    @Input() emit!: (data: any) => void;
    @Input() rendered!: () => void;
    shortLabel: string = '';

    seed = 0;
    @HostBinding('style.background-color') backgroundColor: string = '#fff';

    constructor(
        private cdr: ChangeDetectorRef,
        private eventService: EventService,
    ) {
        this.cdr.detach();
    }

    @HostBinding('class.selected') get selected() {
        return this.data.selected;
    }

    @HostBinding('class.highlighted') get highlighted() {
        return this.data.highlighted;
    }

  @HostListener('click', ['$event']) onClick(event: MouseEvent) {
    this.eventService.publishEditorEvent(EditorEventType.CHOOSE_SECOND_ITEM, { item: this.data, event });
    this.data.selected = true;
  }

    @HostListener('dblclick', ['$event']) onDblClick(btn: any) {
        this.eventService.publishEditorEvent(EditorEventType.SELECT_ITEM, this.data);
    }

    ngOnInit(): void {
        this.updateShortLabel();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            this.backgroundColor = this.data.backgroundColor || '#fff';
            this.updateShortLabel();

        }
        this.cdr.detectChanges();
        requestAnimationFrame(() => this.rendered());
        this.seed++; // force render sockets
    }

    sortByIndex(a: any, b: any) {
        const ai = a.value.index || 0;
        const bi = b.value.index || 0;

        return ai - bi;
    }

    updateShortLabel() {
        const label = this.data.label || '';
        if (label.length > 40) {
            this.shortLabel = label.substring(0, 50) + '...';
        } else {
            this.shortLabel = label;
        }
    }

}
