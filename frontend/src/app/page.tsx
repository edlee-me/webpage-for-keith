import { neon } from "@neondatabase/serverless";
import Form from "@/components/form";
import { MessageEntryType } from "@/types";
import Image from "next/image";
import uploadImage from "@/uploader";
import CloudImage from "@/components/cloudImage";

async function getData() {
  const sql = neon(process.env.DATABASE_URL!);
  const response = await sql`SELECT * FROM love_for_keith`;
  // console.log("Response:", response);

  return response as MessageEntryType[];
}

const handleSubmit = async (formData: FormData) => {
  "use server";

  try {
    const name = formData.get("name");
    const message = formData.get("message");
    const imageInput = formData.get("image") as File | null;
    // const imageUrl = formData.get("imageUrl") as string | null;

    if (!name || !message) {
      throw new Error("Name and message are required");
    }

    let imagePublicId: string | null = null;
    if (imageInput) {
      const res = await uploadImage(imageInput);
      // console.log({ res });

      const { url, public_id } = res as any;
      // imageUrl = url;
      imagePublicId = public_id;

      // console.log("res:", res.url);
    }

    const sql = neon(process.env.DATABASE_URL!);
    // const imageUrl = imageInput ? imageInput.name : null;
    const dateTime = new Date().toISOString();

    await sql`
      INSERT INTO love_for_keith (name, message, image_pub_id, created_at)
      VALUES (${name.toString()}, ${message.toString()}, ${imagePublicId}, ${dateTime})
    `;
  } catch (error) {
    console.error("Error submitting form:", error);
    throw error;
  }
};

export default async function Page() {
  const data: MessageEntryType[] = await getData();

  return (
    <>
      <ul>
        {data.map(({ id, name, message, image_pub_id, created_at }) => {
          return (
            <li key={id}>
              <p>Name: {name}</p>
              <p>Message: {message}</p>
              <p>
                Date:{" "}
                {new Date(created_at).toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {image_pub_id && <CloudImage publicId={image_pub_id} />}
            </li>
          );
        })}
      </ul>
      <Form onSubmit={handleSubmit} />
    </>
  );
}
