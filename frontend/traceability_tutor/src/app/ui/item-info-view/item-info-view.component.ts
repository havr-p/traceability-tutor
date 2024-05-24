import {AfterViewInit, Component, EventEmitter, Input, Output} from '@angular/core';
import {PanelModule} from 'primeng/panel';
import {EditorModule} from 'primeng/editor';
import {DropdownModule} from 'primeng/dropdown';
import {TableModule} from 'primeng/table';
import {NgForOf, NgSwitch, NgSwitchCase, NgSwitchDefault,} from '@angular/common';
import {InplaceModule} from 'primeng/inplace';
import {FormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {EventService} from 'src/app/services/event/event.service';
import {ValidationService} from '../../services/validation/validation.service';
import {ItemDTO, ItemType, RelationshipDTO} from "../../../../gen/model";

@Component({
    selector: 'app-item-info-view',
    templateUrl: './item-info-view.component.html',
    styleUrl: './item-info-view.component.sass',
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
    ],
})
export class ItemInfoViewComponent implements AfterViewInit {
    @Input() item!: ItemDTO;
    @Input() relationships!: RelationshipDTO[]
    @Output() toggleVisible = new EventEmitter<boolean>();
    @Output() viewInitialized = new EventEmitter<void>();
    dataChanges: any;
    dataChanged = false;
    protected readonly ItemType = ItemType;
    protected readonly JSON = JSON;

    constructor(
        private eventService: EventService,
        private validationService: ValidationService,
    ) {
    }

    saveChanges() {
        if (this.dataChanged) {
            const isValid = this.validationService.validateRequirement(
                //this.item.data as Requirement,
            );
            if (isValid) {
                //this.requirementsService.updateRequirement(this.item.data);
                // .subscribe({
                //   next: (response) => {
                //     this.eventService.notify(
                //       'Requirement saved successfully',
                //       'success',
                //     );
                //     this.dataChanged = false;
                //   },
                //   error: (error) => {
                //     this.eventService.notify(
                //       'Failed to save requirement: ' + error.message,
                //       'error',
                //     );
                //   },
                // });
            } else {
                this.eventService.notify(
                    'Validation failed. Changes not saved.',
                    'error',
                );
            }
        } else {
            this.eventService.notify('No changes detected.', 'info');
        }
    }

    cancelChanges() {
        this.toggleVisible.emit(false);
    }

    ngAfterViewInit(): void {
        this.viewInitialized.emit();
    }
}
