/**
 * Generated by orval v6.28.2 🍺
 * Do not edit manually.
 * OpenAPI definition
 * OpenAPI spec version: v0
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
  historyAction?: HistoryAction;
  id?: number;
  release?: number;
  startItem: number;
  type: RelationshipType;
}
