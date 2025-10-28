import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface FileUploadHook {
  selectedFiles: File[];
  isUploading: boolean;
  uploadFiles: (files: FileList | File[]) => Promise<void>;
  removeFile: (index: number) => void;
  clearFiles: () => void;
}

export const useFileUpload = (
  patientInitials?: string,
  onFilesSelected?: (files: File[]) => void
): FileUploadHook => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const generateFileName = useCallback((originalName: string): string => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const initials = patientInitials || 'XX';
    const extension = originalName.split('.').pop();
    
    return `${dateStr}_${timeStr}_${initials}.${extension}`;
  }, [patientInitials]);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      const renamedFiles = fileArray.map(file => {
        const newName = generateFileName(file.name);
        return new File([file], newName, { type: file.type });
      });

      setSelectedFiles(prev => [...prev, ...renamedFiles]);
      onFilesSelected?.(renamedFiles);
      
      toast.success(`${renamedFiles.length} archivo(s) seleccionado(s)`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Error al procesar archivos');
    } finally {
      setIsUploading(false);
    }
  }, [generateFileName, onFilesSelected]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  return {
    selectedFiles,
    isUploading,
    uploadFiles,
    removeFile,
    clearFiles
  };
};