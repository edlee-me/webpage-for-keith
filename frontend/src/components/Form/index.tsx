"use client";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";
import { useState } from "react";

export default function Form({
  onSubmit,
}: {
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(formData: FormData) {
    try {
      const file = formData.get("image") as File | null;

      if (file && file.size > 0) {
        const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
        const formDataToUpload = new FormData();
        formDataToUpload.append("file", file);
        formDataToUpload.append("upload_preset", "love_for_keith");

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formDataToUpload,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const result = await response.json();
        const { public_id } = result as { public_id: string };
        formData.set("public_id", public_id);
      }
      formData.delete("image");
      await onSubmit(formData);

      router.refresh();

      window.scrollTo({ top: 0, behavior: "smooth" });
      setShowForm(false);

      const form = document.querySelector("form") as HTMLFormElement;
      form.reset();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <>
      {showForm && (
        <div className={styles["form-container"]}>
          <form action={handleSubmit}>
            <div className={styles["row"]}>
              <input
                placeholder="Who are you?"
                id="name"
                type="text"
                name="name"
                required
              />
            </div>
            <div className={styles["row"]}>
              <textarea
                placeholder="Say something to Keith"
                id="message"
                name="message"
                required
                rows={16}
              />
            </div>
            <div className={styles["row"]}>
              <label htmlFor="image">Upload photo / image</label>
              <input id="image" type="file" name="image" accept="image/*" />
            </div>
            <button type="submit">💌 Share your love!</button>
            <button onClick={() => setShowForm(false)} className={styles.close}>
              &times;
            </button>
          </form>
        </div>
      )}
      <div className={styles.draft}>
        <button onClick={() => setShowForm(true)}>📝</button>
      </div>
    </>
  );
}
