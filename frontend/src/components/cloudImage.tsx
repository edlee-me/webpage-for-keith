"use client";

import { CldImage } from "next-cloudinary";

const CloudImage = ({ publicId }: { publicId: string }) => {
  return (
    <div className="entry-image">
      <CldImage
        // width="600"
        fill
        objectFit="contain"
        // height="600"
        src={publicId}
        sizes="600"
        alt="Description of my image"
        format="jpg"
      />
    </div>
  );
};

export default CloudImage;
