import { Pager } from './pager.interface';

export interface ApiResult {
  pager?: Pager;
  [modelNameOrAttribute: string]: any;
}
