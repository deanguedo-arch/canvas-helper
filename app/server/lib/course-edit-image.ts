import sharp from "sharp";

const MAX_IMAGE_PIXELS = 32_000_000;
export const MAX_COURSE_EDIT_IMAGE_BYTES = 10 * 1024 * 1024;

export type ValidatedCourseEditImage = {
  extension: "png" | "jpg" | "gif";
  mimeType: "image/png" | "image/jpeg" | "image/gif";
  width: number;
  height: number;
};

function expectedImageType(bytes: Buffer): Pick<ValidatedCourseEditImage, "extension" | "mimeType"> | null {
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { extension: "png", mimeType: "image/png" };
  }
  if (bytes.length >= 10 && (bytes.subarray(0, 6).toString("ascii") === "GIF87a" || bytes.subarray(0, 6).toString("ascii") === "GIF89a")) {
    return { extension: "gif", mimeType: "image/gif" };
  }
  if (bytes.length >= 12 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }
  return null;
}

export async function validateCourseEditImage(bytes: Buffer): Promise<ValidatedCourseEditImage> {
  if (!bytes.length || bytes.length > MAX_COURSE_EDIT_IMAGE_BYTES) throw new Error("Images must be 10 MB or smaller.");
  const expected = expectedImageType(bytes);
  if (!expected) throw new Error("Studio accepts validated PNG, JPEG, or GIF images only.");
  try {
    const decoderOptions = {
      failOn: "warning" as const,
      limitInputPixels: MAX_IMAGE_PIXELS,
      limitInputChannels: 4,
      animated: expected.extension === "gif",
      sequentialRead: true
    };
    const metadata = await sharp(bytes, decoderOptions).metadata();
    const metadataHeight = metadata.pageHeight ?? metadata.height ?? 0;
    const totalPages = metadata.pages ?? 1;
    if (!metadata.width || !metadataHeight || metadata.width * metadataHeight * totalPages > MAX_IMAGE_PIXELS) {
      throw new Error("This image has invalid dimensions or exceeds 32 million decoded pixels.");
    }
    const decoded = await sharp(bytes, decoderOptions).raw().toBuffer({ resolveWithObject: true });
    const format = metadata.format === "jpeg" ? "jpg" : metadata.format;
    const height = decoded.info.pages && decoded.info.pageHeight
      ? decoded.info.pageHeight
      : decoded.info.height;
    if (format !== expected.extension || !decoded.info.width || !height) {
      throw new Error("The decoded image type or dimensions do not match its file signature.");
    }
    if (decoded.info.width * height > MAX_IMAGE_PIXELS) {
      throw new Error("This image exceeds 32 million pixels.");
    }
    return {
      ...expected,
      width: decoded.info.width,
      height
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Studio could not fully decode this image safely: ${detail}`);
  }
}
