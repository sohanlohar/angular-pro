export interface DashboardTileAction {
  mainTitle: string;
  title: string;
  copy?: string;
  actions: DashboardActionButton[];
  size?: 's' | 'm' | 'l';
}

export interface DashboardActionButton {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routerLink: any[];
  color: ActionColor;
}

export enum ActionColor {
  PRIMARY = 'primary',
  SECONDARY = 'accent',
  NONE = 'none',
}

export interface SummaryTile {
  image: string;
  title: string;
  count: number;
  link: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routerLink?: any[];
  color?: string;
}

export interface NewsPromo {
  imageUrl: string;
}
