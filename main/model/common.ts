import { Type } from '@angular/core';
import { Observable } from 'rxjs';

export interface IPaginationResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface IPaginationParams {
  limit?: string;
  offset?: string;
}

export interface Variant {
  components: Type<any>[],
  props?: any
}

export interface ComponentUsageCondition {
  dependsOn: Observable<boolean>[],
  canBeApplied: () => boolean
  getData: () => any
}
