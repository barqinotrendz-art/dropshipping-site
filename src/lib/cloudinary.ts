import { Cloudinary } from "@cloudinary/url-gen";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET as string;

if (!cloudName) {
  throw new Error('VITE_CLOUDINARY_CLOUD_NAME is not defined in environment variables');
}

export const cld = new Cloudinary({
  cloud: { cloudName: cloudName || "demo" },
});

/**
 * Get Cloudinary cloud name from environment variables
 */
export const getCloudName = (): string => {
  return cloudName || "demo";
};

/**
 * Get Cloudinary upload preset from environment variables
 */
export const getUploadPreset = (): string => {
  return uploadPreset || "unsigned_preset";
};

/**
 * Generate optimized Cloudinary URL for an image
 * @param publicId - Cloudinary public ID
 * @param width - Image width
 * @param height - Image height
 * @returns Optimized Cloudinary URL
 */
export const getCloudinaryUrl = (
  publicId: string,
  width: number = 400,
  height: number = 400
): string => {
  if (!publicId) return "/placeholder-image.jpg";
  if (publicId.startsWith('http')) return publicId;
  
  const cloud = getCloudName();
  return `https://res.cloudinary.com/${cloud}/image/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${publicId}`;
};

/**
 * Get Cloudinary API upload URL
 * @returns Upload endpoint URL
 */
export const getUploadUrl = (): string => {
  const cloud = getCloudName();
  return `https://api.cloudinary.com/v1_1/${cloud}/image/upload`;
};
