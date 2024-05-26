import {Injectable} from '@angular/core';
import {RelationshipType} from "../../../../gen/model";
import {Item} from "../../models/itemMapper";

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    constructor() {
    }



    isValidConnection(fromItem: Item, toItem: Item, relationshipType: RelationshipType): boolean {
        return true;
    }

    doesCreateCycle(fromItem: Item, toItem: Item): boolean {
        return false;
    }


    validateItemEdits(item: Item, updates: any): string[] {
        return [];
    }
}
