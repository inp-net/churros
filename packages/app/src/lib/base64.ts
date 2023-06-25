export async function arrayBufferToBase64(buf: ArrayBuffer): Promise<string> {
  const blob = new Blob([buf], { type: 'application/octet-stream' });
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };

    reader.addEventListener('error', reject);
  });
}
