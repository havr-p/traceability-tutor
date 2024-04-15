import { ItemType } from '../types';
import { Requirement } from '../models/requirement';

export interface Node {
  width: number;
  height: number;
  type: ItemType | undefined;
  data: Requirement;
  // | { commitId: string; commitMessage: string; commitDate: Date };
}
