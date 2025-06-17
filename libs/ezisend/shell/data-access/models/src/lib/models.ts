export interface NavItem {
  displayName: string;
  disabled?: boolean;
  iconName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routerLink?: any[];
  queryParam?: any;
  children?: NavItem[];
}
export interface languageList {
  value: string;
  initial: string;
  viewValue: string;
  imageUrl: string;
}