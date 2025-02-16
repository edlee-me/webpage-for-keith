"use client";

import { CldImage } from "next-cloudinary";

const CloudImage = ({ publicId }: { publicId: string }) => {
  return (
    <div className="entry-image">
      <CldImage
        // width="600"
        // fill
        // objectFit="contain"
        width={0}
        height={0}
        // height="280"
        src={publicId}
        sizes="100%"
        alt="Description of my image"
        format="jpg"
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
};

export default CloudImage;
