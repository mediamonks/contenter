export function downloadFile(url: string, name: string): void {
  const anchorNode = document.createElement('a');
  anchorNode.setAttribute('style', 'display: hidden;');
  anchorNode.setAttribute('href', url);
  anchorNode.setAttribute('download', name);
  anchorNode.setAttribute('target', '_blank');
  anchorNode.click();
  anchorNode.remove();
}
