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
    // @ts-ignore
    .query({ name: 'clipboard-write' });

  if (result.state !== 'granted' && result.state !== 'prompt') throw new Error('permission denied');
  await navigator.clipboard.writeText(value);
}

function parseUnitSize(value: number, unit: Unit, decimals = 2) {
  const conversion = convert(value).from(unit).toBest();

  const dm = decimals < 0 ? 0 : decimals;
  return `${conversion.val.toFixed(dm)}${conversion.unit}`;
}

export {
  downloadFile,
  copyValueToClipboard,
  parseUnitSize,
};
