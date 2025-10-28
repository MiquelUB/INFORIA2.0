import React, { useRef } from 'react';
import { Upload, File, X, FileAudio, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  files: File[];
  onFilesSelected: (files: FileList) => void;
  onFileRemove: (index: number) => void;
  acceptedTypes?: string;
  maxFiles?: number;
  isDisabled?: boolean;
  className?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  files,
  onFilesSelected,
  onFileRemove,
  acceptedTypes = ".wav,.mp3,.m4a,.txt,.pdf,.doc,.docx",
  maxFiles = 10,
  isDisabled = false,
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      onFilesSelected(droppedFiles);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('audio/')) return <FileAudio className="w-4 h-4" />;
    if (file.type.startsWith('text/') || file.name.endsWith('.txt')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card 
        className={cn(
          "border-2 border-dashed cursor-pointer transition-colors",
          isDisabled ? "border-gray-300 cursor-not-allowed" : "border-gray-400 hover:border-primary",
          files.length >= maxFiles && "cursor-not-allowed opacity-50"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!isDisabled && files.length < maxFiles ? handleFileSelect : undefined}
      >
        <CardContent className="p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">
            Seleccionar archivos
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-400">
            Tipos permitidos: {acceptedTypes}
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleFileChange}
        className="hidden"
        disabled={isDisabled || files.length >= maxFiles}
      />

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Archivos seleccionados ({files.length})</h4>
          {files.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {file.type.split('/')[0]}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemove(index);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;