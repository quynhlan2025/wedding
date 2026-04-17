'use client';

import { useRef, useState } from 'react';
import { Upload, X, ImageIcon, RotateCcw } from 'lucide-react';

interface Props {
  value: string;              // current image URL (Cloudinary secure_url or any URL)
  onChange: (url: string, publicId?: string) => void;
  folder?: string;            // Cloudinary folder, e.g. "trainers"
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  error?: { message: string };
}

// Extract public_id from a Cloudinary URL
function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

const CLOUD_NAME   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '';
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export default function ImageUpload({ value, onChange, folder = 'misc' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null); // local blob preview

  const handleFile = async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Chỉ hỗ trợ JPG, PNG, WEBP.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('File tối đa 10 MB.');
      return;
    }

    setError('');
    setProgress(0);
    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', `gym-media/${folder}`);

    try {
      // Use XMLHttpRequest to track upload progress
      const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = e => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          const data: CloudinaryResponse = JSON.parse(xhr.responseText);
          if (xhr.status === 200) resolve(data);
          else reject(new Error(data.error?.message ?? 'Upload failed'));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
        xhr.send(formData);
      });

      onChange(result.secure_url, result.public_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload thất bại.');
    } finally {
      setUploading(false);
      setPreview(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Xoá ảnh này khỏi Cloudinary?')) return;
    const publicId = extractPublicId(value);
    if (publicId) {
      await fetch('/api/cloudinary', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      });
    }
    onChange('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const displayed = preview ?? value;

  return (
    <div className="space-y-2">
      {/* Preview */}
      {displayed ? (
        <div className="relative group h-44 bg-[#04080f] border border-white/10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayed} alt="preview" className="w-full h-full object-cover" />

          {/* Upload progress overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-[#E8192C] border-t-transparent rounded-full animate-spin" />
              <div className="w-48 h-1 bg-white/10 overflow-hidden">
                <div className="h-full bg-[#E8192C] transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
              <span className="font-['DM_Sans'] text-xs text-white/60">{progress}%</span>
            </div>
          )}

          {/* Hover actions */}
          {!uploading && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button type="button" onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-['DM_Sans'] text-xs px-3 py-2 transition-colors">
                <RotateCcw size={12} /> Đổi ảnh
              </button>
              <button type="button" onClick={handleDelete}
                className="flex items-center gap-1.5 bg-[#E8192C]/20 hover:bg-[#E8192C]/40 border border-[#E8192C]/30 text-[#E8192C] font-['DM_Sans'] text-xs px-3 py-2 transition-colors">
                <X size={12} /> Xoá
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center h-44 border border-dashed transition-colors ${
            uploading
              ? 'border-[#E8192C]/40 bg-[#E8192C]/5 cursor-default'
              : 'border-white/15 hover:border-[#E8192C]/40 hover:bg-[#E8192C]/5 cursor-pointer'
          }`}>
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#E8192C] border-t-transparent rounded-full animate-spin" />
              <div className="w-48 h-1 bg-white/10 overflow-hidden">
                <div className="h-full bg-[#E8192C] transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
              <span className="font-['DM_Sans'] text-xs text-white/50">{progress}% — đang upload lên Cloudinary...</span>
            </div>
          ) : (
            <>
              <ImageIcon size={28} className="text-white/20 mb-2" />
              <span className="font-['DM_Sans'] text-sm text-white/40">Kéo thả hoặc click để chọn ảnh</span>
              <span className="font-['DM_Sans'] text-xs text-white/20 mt-1">JPG · PNG · WEBP · tối đa 10 MB</span>
            </>
          )}
        </div>
      )}

      {/* Manual URL input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Hoặc dán URL ảnh vào đây..."
          className="flex-1 bg-[#04080f] border border-white/10 focus:border-[#E8192C] text-white placeholder-white/20 font-['DM_Sans'] text-xs px-3 py-2 outline-none transition-colors"
        />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/50 hover:text-white disabled:opacity-30 font-['DM_Sans'] text-xs px-3 py-2 transition-colors whitespace-nowrap">
          <Upload size={12} /> Upload
        </button>
      </div>

      {error && (
        <p className="font-['DM_Sans'] text-xs text-[#E8192C] flex items-center gap-1.5">
          <X size={11} /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
}
