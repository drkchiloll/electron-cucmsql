declare interface CucmQuery {
  id?: string;
  name: string;
  query: string;
  type?: string;
}

declare type CucmStoreState = CucmQuery[];