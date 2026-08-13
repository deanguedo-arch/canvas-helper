const MAX_IMAGE_PIXELS = 32_000_000;
export const MAX_COURSE_EDIT_IMAGE_BYTES = 10 * 1024 * 1024;

export type ValidatedCourseEditImage = {
  extension: "png" | "jpg" | "gif";
  mimeType: "image/png" | "image/jpeg" | "image/gif";
  width: number;
  height: number;
};

function jpegDimensions(bytes: Buffer) {
  let offset = 2;
  const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const length = bytes.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > bytes.length) break;
    if (sof.has(marker)) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  return null;
}

export function validateCourseEditImage(bytes: Buffer): ValidatedCourseEditImage {
  if (!bytes.length || bytes.length > MAX_COURSE_EDIT_IMAGE_BYTES) throw new Error("Images must be 10 MB or smaller.");
  let image: ValidatedCourseEditImage | null = null;
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    image = { extension: "png", mimeType: "image/png", width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  } else if (bytes.length >= 10 && (bytes.subarray(0, 6).toString("ascii") === "GIF87a" || bytes.subarray(0, 6).toString("ascii") === "GIF89a")) {
    image = { extension: "gif", mimeType: "image/gif", width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
  } else if (bytes.length >= 12 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    const dimensions = jpegDimensions(bytes);
    if (dimensions) image = { extension: "jpg", mimeType: "image/jpeg", ...dimensions };
  }
  if (!image) throw new Error("Studio accepts validated PNG, JPEG, or GIF images only.");
  if (!image.width || !image.height || image.width * image.height > MAX_IMAGE_PIXELS) {
    throw new Error("This image has invalid dimensions or exceeds 32 million pixels.");
  }
  return image;
}
