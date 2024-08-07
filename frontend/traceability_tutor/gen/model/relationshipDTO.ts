/**
 * Generated by orval v6.29.1 🍺
 * Do not edit manually.
 * traceability-tutor
 */
import type { HistoryAction } from './historyAction';
import type { RelationshipType } from './relationshipType';

export interface RelationshipDTO {
  /**
   * @minLength 0
   * @maxLength 255
   */
  description?: string;
  endItem: number;
  endItemInternalId: number;
  historyAction?: HistoryAction;
  id: number;
  iterationId: number;
  projectId: number;
  startItem: number;
  startItemInternalId: number;
  type: RelationshipType;
}
