import { Requirement } from '../models/requirement';
import { getColorByLevel } from '../utils';
import { Node } from './Node';
import { ClassicPreset } from 'rete';
import { NodeType } from '../types';

export class RequirementNode extends ClassicPreset.Node implements Node {
  width = 400;
  height = 200;
  type = NodeType.REQUIREMENT;
  backgroundColor: string;
  borderStyle: string;
  data: any;
  constructor(requirement: Requirement) {
    super(requirement.name);
    //console.log(requirement);
    this.id = requirement.id;
    this.borderStyle = '2px solid #000000';
    this.backgroundColor = getColorByLevel(requirement.level);
    this.selected = false;
    this.data = requirement;
  }

  // execute() {}
  //  data() {
  //    return this.requirement;
  //  }
}
