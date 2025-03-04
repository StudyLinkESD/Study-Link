// ImageCropper.tsx
import React, { useState, useRef } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

type ImageCropperProps = {
  image: File | string;
  onSave: (file: File, previewUrl: string) => void;
  onCancel: () => void;
  width?: number;
  height?: number;
  borderRadius?: number;
  isCircular?: boolean;
};

const ImageCropper: React.FC<ImageCropperProps> = ({
  image,
  onSave,
  onCancel,
  width = 250,
  height = 250,
  borderRadius,
  isCircular = true,
}) => {
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const editorRef = useRef<AvatarEditor | null>(null);

  // Calcul automatique du borderRadius si l'image doit être circulaire
  const effectiveBorderRadius = isCircular ? width / 2 : borderRadius || 0;

  const handleSave = () => {
    if (editorRef.current) {
      // Obtenir l'image recadrée sous forme de canvas
      const canvas = editorRef.current.getImageScaledToCanvas();

      // Convertir le canvas en Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Créer un fichier à partir du Blob avec un nom unique
            const fileName = `profile-${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });

            // Créer une URL pour prévisualisation
            const previewUrl = URL.createObjectURL(blob);

            // Envoyer au composant parent
            onSave(file, previewUrl);
          }
        },
        'image/jpeg',
        0.95,
      );
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-background border rounded-lg">
      <h3 className="text-lg font-semibold">Ajuster votre photo</h3>

      <div className="border rounded-lg overflow-hidden">
        <AvatarEditor
          ref={editorRef}
          image={image}
          width={width}
          height={height}
          border={20}
          color={[0, 0, 0, 0.6]} // Couleur de l'arrière-plan (RGBA)
          scale={scale}
          rotate={rotate}
          borderRadius={effectiveBorderRadius}
        />
      </div>

      <div className="w-full space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Zoom</label>
          <Slider
            min={1}
            max={3}
            step={0.01}
            value={[scale]}
            onValueChange={(value) => setScale(value[0])}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Rotation</label>
          <Slider
            min={0}
            max={360}
            step={1}
            value={[rotate]}
            onValueChange={(value) => setRotate(value[0])}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSave}>Appliquer</Button>
      </div>
    </div>
  );
};

export default ImageCropper;
