import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// cloudinary.config({
//     cloud_name: 'dkekuwytp',
//     api_key: '615363812373314',
//     api_secret: 'aM_kdIToyU_CHgGcnJSTbZVpQNs'
// });

export default cloudinary;
