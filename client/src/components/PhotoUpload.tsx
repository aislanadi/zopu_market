import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2, X, User } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

export function PhotoUpload({ currentPhotoUrl, onUploadSuccess, size = "md" }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.buyer.uploadPhoto.useMutation({
    onSuccess: (data) => {
      setPreview(data.url);
      toast.success("Foto atualizada com sucesso!");
      onUploadSuccess?.(data.url);
    },
    onError: (error) => {
      toast.error("Erro ao fazer upload", {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Imagem muito grande", {
        description: "Tamanho máximo: 5MB",
      });
      return;
    }

    // Validar formato
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato inválido", {
        description: "Use JPG, PNG ou WEBP",
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    setIsUploading(true);
    const base64Reader = new FileReader();
    base64Reader.onloadend = () => {
      const base64String = (base64Reader.result as string).split(',')[1];
      uploadMutation.mutate({
        fileData: base64String,
        fileName: file.name,
        contentType: file.type,
      });
    };
    base64Reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={preview || undefined} alt="Foto de perfil" />
        <AvatarFallback>
          <User className="h-8 w-8 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {preview ? "Alterar" : "Escolher"} Foto
              </>
            )}
          </Button>

          {preview && !isUploading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG ou WEBP. Máximo 5MB.
        </p>
      </div>
    </div>
  );
}
