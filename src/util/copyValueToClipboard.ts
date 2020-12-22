export async function copyValueToClipboard(value: string) {
  const result = await navigator
    .permissions
    .query({ name: 'clipboard-write' as PermissionName });

  if (result.state !== 'granted' && result.state !== 'prompt') throw new Error('permission denied');
  await navigator.clipboard.writeText(value);
}
