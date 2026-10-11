import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "portfolio", resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);

        let finalUrl = result.secure_url;
        // Images: ask Cloudinary to deliver a compressed, modern-format,
        // max-1920px version. PDFs are left alone.
        if (result.resource_type === "image" && result.format !== "pdf") {
          finalUrl = finalUrl.replace("/upload/", "/upload/f_auto,q_auto,w_1920,c_limit/");
        }
        resolve({ url: finalUrl, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
}