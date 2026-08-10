import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Uploads a File to Firebase Storage and returns its HTTPS download URL.
 */
export async function uploadFileToStorage(file: File, folderName: string = 'uploads'): Promise<string> {
  if (!file) {
    throw new Error('لم يتم تحديد أي ملف للرفع');
  }

  // Validate image file type
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/svg+xml'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error('نوع الملف غير مدعوم. يرجى رفع صورة بصيغة (PNG, JPG, WEBP, SVG)');
  }

  // Max 10MB check
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('حجم الصورة كبير جداً (الأقصى 10 ميغابايت)');
  }

  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${folderName}/${timestamp}_${sanitizedName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error: any) {
    console.error('Firebase Storage Upload Error:', error);
    throw new Error(`فشل رفع الصورة إلى Firebase Storage: ${error.message || 'يرجى التحقق من الاتصال وقواعد التخزين'}`);
  }
}

/**
 * Converts a Base64 / Data URL to a Blob and uploads it to Firebase Storage,
 * returning the HTTPS download URL.
 */
export async function uploadDataUrlToStorage(dataUrl: string, folderName: string = 'uploads'): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    // If it's already an HTTP / HTTPS URL, return as is
    if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
      return dataUrl;
    }
    throw new Error('صيغة الصورة غير صالحة للرفع');
  }

  try {
    // Convert dataUrl to blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `upload_${Date.now()}.png`, { type: blob.type || 'image/png' });

    return await uploadFileToStorage(file, folderName);
  } catch (error: any) {
    console.error('DataURL Upload Error:', error);
    throw new Error(`تعذر معالجة ورفع الصورة: ${error.message || 'خطأ غير معروف'}`);
  }
}


export async function deleteFileFromStorageUrl(url: string | null | undefined): Promise<void> {
  if (!url || !url.includes('firebasestorage.googleapis.com')) return;
  try { await deleteObject(ref(storage, url)); }
  catch (error: any) { console.warn('Firebase Storage delete skipped:', error?.message || error); }
}
