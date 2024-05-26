import {ClassicPreset} from 'rete';
import {ItemProps} from './types';
import {Subject} from 'rxjs';
import {CreateRelationshipDTO, RelationshipDTO, RelationshipType} from "../../gen/model";

// export class Connection<
//   A extends NodeProps,
//   B extends NodeProps
// > extends ClassicPreset.Connection<A, B> {
//   //isLoop?: boolean;
//   label?: string;
// }

export class Connection<
  Source extends ItemProps,
  Target extends ItemProps,
> extends ClassicPreset.Connection<Source, Target> {
  selected?: boolean;
  data: RelationshipDTO | CreateRelationshipDTO;
  private changes = new Subject<any>();
  public changes$ = this.changes.asObservable();

  constructor(
              source: Source,
              sourceOutput: keyof Source['outputs'],
              target: Target,
              targetInput: keyof Target['inputs'],
              relationshipData: RelationshipDTO | CreateRelationshipDTO) {

    super(source, sourceOutput, target, targetInput);
    this.data = relationshipData;
      }


  public updateData(data: any) {
    this.data = data.data ?? this.data;
    this.selected = data.selected ?? this.selected;
    this.changes.next(data);
  }
}
