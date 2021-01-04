import convert from 'convert-units';
import { Unit } from '@/types/unitTypes';

export function parseUnitSize(value: number, unit: Unit, decimals = 2): string {
  const conversion = convert(value).from(unit).toBest();

  const dm = Math.max(decimals, 0);
  return `${conversion.val.toFixed(dm)}${conversion.unit}`;
}
