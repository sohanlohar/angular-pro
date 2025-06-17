export interface ButtonInfo {
  buttonName: string;
  isPrimary: boolean;
  buttonIcon?: string;
  routerLink: any[];
}

export const AuthErrorCodes = {
  'E1003': 'invalid',
  'E2002': 'blocked',
  'E1004': 'unauthorized',
  'E2001': 'migrated',
  'E2004': 'accountDeactivated',
  'E2003': 'accountBlocked',
  'E2005': 'deleteUser'
}