import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { storage } from '../firebase';

export interface UploadedImageResult {
  url: string;
  storagePath: string;
}

function compressImageFileToBlob(file: File, maxWidth = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () =>
        reject(new Error('Arquivo selecionado não é uma imagem válida.'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Não foi possível processar a imagem.'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.82
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function sanitizeStorageFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  return (base.slice(0, 40) || 'imagem').toLowerCase();
}

export async function uploadProductImage(
  productId: string,
  file: File
): Promise<UploadedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem válido (JPG, PNG ou WebP).');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('A imagem deve ter no máximo 10 MB.');
  }

  const compressedBlob = await compressImageFileToBlob(file, 800);
  const safeName = sanitizeStorageFileName(file.name);
  const storagePath = `products/${productId}/${Date.now()}-${safeName}.jpg`;
  const storageRef = ref(storage, storagePath);

  try {
    await uploadBytes(storageRef, compressedBlob, {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=31536000',
    });
    const url = await getDownloadURL(storageRef);
    return { url, storagePath };
  } catch (err) {
    const code = (err as { code?: string })?.code ?? '';
    if (
      code.includes('unauthorized') ||
      code.includes('unauthenticated') ||
      code.includes('unknown')
    ) {
      throw new Error(
        'Não foi possível enviar a foto para o Firebase Storage. Verifique se o Storage e as regras (storage.rules) estão ativos no Console do Firebase ou use uma foto padrão / URL.'
      );
    }
    throw new Error(
      'Erro ao enviar a imagem para o Firebase Storage. Tente novamente ou informe uma URL.'
    );
  }
}

export async function uploadRestaurantLogo(
  file: File
): Promise<UploadedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem válido para o logotipo.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('O logotipo deve ter no máximo 5 MB.');
  }

  const compressedBlob = await compressImageFileToBlob(file, 400);
  const safeName = sanitizeStorageFileName(file.name);
  const storagePath = `restaurants/default/logo-${Date.now()}-${safeName}.jpg`;
  const storageRef = ref(storage, storagePath);

  try {
    await uploadBytes(storageRef, compressedBlob, {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=31536000',
    });
    const url = await getDownloadURL(storageRef);
    return { url, storagePath };
  } catch (err) {
    const code = (err as { code?: string })?.code ?? '';
    if (
      code.includes('unauthorized') ||
      code.includes('unauthenticated') ||
      code.includes('unknown')
    ) {
      throw new Error(
        'Firebase Storage não autorizado ou ainda não habilitado no Console. Você pode informar uma URL de logotipo ou ativar o Storage.'
      );
    }
    throw new Error('Erro ao enviar logotipo para o Firebase Storage.');
  }
}

export async function deleteStorageFileIfManaged(
  storagePath?: string
): Promise<void> {
  if (!storagePath) return;
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (err) {
    const code = (err as { code?: string })?.code ?? '';
    if (code !== 'storage/object-not-found') {
      console.warn('Aviso ao remover arquivo anterior no Storage:', code || err);
    }
  }
}
