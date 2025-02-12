"use client";

import { useRouter } from "next/navigation";
import { type PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import { useState, useRef } from "react";
// import heic2any from "heic2any";
import { heicTo, isHeic } from "heic-to";
import uploadImage from "@/uploader";
// import sharp from "sharp";
// import multer from "multer";

export default function Form({
  onSubmit,
}: {
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  //   const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const router = useRouter();

//   async function convertHeicToJpeg(file: File) {
//     const ext = file?.name.split(".").pop()?.toLowerCase();
//     const isFileHeic = await isHeic(file);
//     if (isFileHeic) {
//       try {
//         console.log(typeof window);

//         if (typeof window !== "undefined") {
//           // import heic2any from "heic2any";
//           // eslint-disable-next-line @typescript-eslint/no-var-requires
//           //   const heic2any = require("heic2any");
//           const output = await heicTo({
//             blob: file,
//             type: "image/jpeg",
//             quality: 0.7,
//           });
//           // Check if the output is a single Blob or an array of Blobs
//           const outputBlob = Array.isArray(output) ? output[0] : output; // Assuming we use the first Blob if it's an array
//           console.log("outputBlob:", outputBlob);

//           // Create a new File object from the Blob
//           const newName = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
//           return new File([outputBlob], newName, {
//             type: "image/jpeg",
//           });
//         }
//       } catch (error) {
//         console.error("Error converting HEIC/HEIF file:", error);
//         return file; // Return the original file in case of an error
//       }
//     }
//   }

  async function handleSubmit(formData: FormData) {
    try {
      //   const file = inputFileRef.current.files[0];
      const imageInput = formData.get("image") as File | null;

      if (imageInput) {
        console.log("imageInput:", imageInput.type);
        // let convertedImage: File | undefined = imageInput;

        // if (
        //   imageInput.type === "image/heic" ||
        //   imageInput.type === "image/heif"
        // ) {
        //   convertedImage = await convertHeicToJpeg(imageInput);
        //   //   if (convertedImage) {
        //   //   }
        // }

        // const newBlob = await upload(imageInput.name, convertedImage!, {
        //   access: "public",
        //   handleUploadUrl: "/api/upload",
        // });

        // uploadImage(imageInput);


        // console.log("newBlob:", newBlob);
        // setBlob(newBlob);
        // formData.append("imageUrl", newBlob.url);
      }

      await onSubmit(formData);
      router.refresh();
      // Optional: Reset form
      const form = document.querySelector("form") as HTMLFormElement;
      form.reset();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <form action={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input id="name" type="text" name="name" required />
      </div>
      <div>
        <label htmlFor="message">Message:</label>
        <textarea id="message" name="message" required />
      </div>
      <div>
        <label htmlFor="image">Image:</label>
        <input id="image" type="file" name="image" accept="image/*" />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
