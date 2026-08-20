import * as dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Envio de Imagens para o Cloudinary (Capas de livros, fotos, etc.)
 */
export async function uploadToCloudinary(
  folder: string,
  publicId: string,
  buffer: Buffer,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `jimue/${folder}`,
        public_id: publicId,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);

        const rawUrl = result?.secure_url || '';

        // Encapsula a URL do Cloudinary no visualizador universal para iFrames
        const embeddedViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(rawUrl)}`;

        resolve(embeddedViewerUrl);
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

/**
 * Envio de PDFs para o Cloudinary
 * Utiliza resource_type: 'raw' para ficheiros de documento (PDF, ZIP, DOCX, etc.)
 */
export async function uploadPdfToCloudinary(
  folder: string,
  publicId: string,
  buffer: Buffer,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `jimue/${folder}`,
        public_id: `${publicId}.pdf`, // Inclui a extensão .pdf no ID para o browser reconhecer o ficheiro corretamente
        resource_type: 'raw',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || '');
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}