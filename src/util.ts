// TODO: these util functions are not related so they should not be put in the same file
// TODO: this file is not important enough to be in the root of the src.
//  Please move to a sub directory
import convert from 'convert-units';
import { Unit } from '@/unitTypes';

function downloadFile(url: string, name: string) {
  const anchorNode = document.createElement('a');
  anchorNode.setAttribute('style', 'display: hidden;');
  anchorNode.setAttribute('href', url);
  anchorNode.setAttribute('download', name);
  anchorNode.setAttribute('target', '_blank');
  anchorNode.click();
  anchorNode.remove();
}

async function copyValueToClipboard(value: string) {
  const result = await navigator
    .permissions
    .query({ name: 'clipboard-write' as PermissionName });

  if (result.state !== 'granted' && result.state !== 'prompt') throw new Error('permission denied');
  await navigator.clipboard.writeText(value);
}

function parseUnitSize(value: number, unit: Unit, decimals = 2) {
  const conversion = convert(value).from(unit).toBest();

  // TODO: const dm = Math.max(decimals, 0);
  const dm = decimals < 0 ? 0 : decimals;
  return `${conversion.val.toFixed(dm)}${conversion.unit}`;
}

export {
  downloadFile,
  copyValueToClipboard,
  parseUnitSize,
};
