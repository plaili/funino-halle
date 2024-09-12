import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class StrengthService {
  getName(strength: number) {
    switch (strength) {
      case 0:
        return 'stark';
      case 1:
        return 'mittel';
      case 2:
        return 'schwach';
      default:
        return 'WTF!';
    }
  }
}
