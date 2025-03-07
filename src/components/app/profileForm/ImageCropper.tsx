import AvatarEditor from 'react-avatar-editor';

import Image from 'next/image';
import React, { useRef, useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

import { cn } from '@/lib/utils';

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
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});
  const editorRef = useRef<AvatarEditor | null>(null);

  const effectiveBorderRadius = isCircular ? width / 2 : borderRadius || 0;

  const updatePreviews = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();

      const sizes = {
        sm: 40,
        md: 64,
        lg: 96,
      };

      const newPreviewUrls: { [key: string]: string } = {};

      Object.entries(sizes).forEach(([size, dimension]) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = dimension;
        tempCanvas.height = dimension;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, 0, dimension, dimension);
          newPreviewUrls[size] = tempCanvas.toDataURL('image/jpeg', 0.95);
        }
      });

      setPreviewUrls(newPreviewUrls);
    }
  };

  const handleSave = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const fileName = `profile-${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            const previewUrl = URL.createObjectURL(blob);
            onSave(file, previewUrl);
          }
        },
        'image/jpeg',
        0.95,
      );
    }
  };

  return (
    <div className="bg-background mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-lg border p-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Ajuster votre photo</h3>
        <p className="text-muted-foreground text-sm">
          Positionnez votre visage au centre et utilisez le zoom pour un meilleur cadrage
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="border-primary/20 h-full w-full rounded-full border-2 border-dashed" />
          <div className="border-primary/20 absolute inset-1/4 rounded-full border-2 border-dashed" />
        </div>

        <div className="overflow-hidden rounded-lg border">
          <AvatarEditor
            ref={editorRef}
            image={image}
            width={width}
            height={height}
            border={20}
            color={[0, 0, 0, 0.6]}
            scale={scale}
            rotate={rotate}
            borderRadius={effectiveBorderRadius}
            onImageChange={updatePreviews}
            onImageReady={updatePreviews}
            onPositionChange={updatePreviews}
          />
        </div>
      </div>

      <div className="flex items-end gap-8">
        {Object.entries(previewUrls).map(([size, url]) => (
          <div key={size} className="text-center">
            <p className="text-muted-foreground mb-2 text-xs">
              {size === 'sm' ? 'Miniature' : size === 'md' ? 'Navigation' : 'Profil'}
            </p>
            <Avatar
              className={cn(
                size === 'sm' && 'h-10 w-10',
                size === 'md' && 'h-16 w-16',
                size === 'lg' && 'h-24 w-24',
              )}
            >
              <Image
                src={url}
                alt={`Aperçu ${size}`}
                className="h-full w-full object-cover"
                width={size === 'sm' ? 40 : size === 'md' ? 64 : 96}
                height={size === 'sm' ? 40 : size === 'md' ? 64 : 96}
                priority
              />
            </Avatar>
          </div>
        ))}
      </div>

      <div className="w-full space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Zoom</label>
            <span className="text-muted-foreground text-sm">{Math.round(scale * 100)}%</span>
          </div>
          <Slider
            min={1}
            max={3}
            step={0.01}
            value={[scale]}
            onValueChange={(value) => {
              setScale(value[0]);
              updatePreviews();
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Rotation</label>
            <span className="text-muted-foreground text-sm">{rotate}°</span>
          </div>
          <Slider
            min={0}
            max={360}
            step={1}
            value={[rotate]}
            onValueChange={(value) => {
              setRotate(value[0]);
              updatePreviews();
            }}
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
