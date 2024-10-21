import { InjectionToken } from '@angular/core';

// Create an injection token for browser storage
export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => localStorage
});
