import cloudinaryPackage from "cloudinary";

const { v2: cloudinary } = cloudinaryPackage;

const requiredCloudinaryEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingCloudinaryEnv = requiredCloudinaryEnv.filter(
  (key) => !process.env[key],
);

if (missingCloudinaryEnv.length === 0) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export const isCloudinaryConfigured = missingCloudinaryEnv.length === 0;

export const assertCloudinaryConfigured = () => {
  if (isCloudinaryConfigured) return;
  throw new Error(
    `Cloudinary is not configured. Missing env vars: ${missingCloudinaryEnv.join(", ")}`,
  );
};

export default cloudinary;
