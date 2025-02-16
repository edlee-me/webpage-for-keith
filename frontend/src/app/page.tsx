import { neon } from "@neondatabase/serverless";
import Form from "@/components/Form";
import { MessageEntryType } from "@/types";
// import uploadImage from "@/uploader";
import CloudImage from "@/components/cloudImage";
import styles from "./page.module.scss";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import Hearts from "@/components/Hearts";

async function getData() {
  const sql = neon(process.env.DATABASE_URL!);
  const response =
    await sql`SELECT * FROM love_for_keith ORDER BY created_at DESC`;
  // console.log("Response:", response);
  return response as MessageEntryType[];
}

const handleSubmit = async (formData: FormData) => {
  "use server";

  try {
    const name = formData.get("name");
    const message = formData.get("message");
    // const imageInput = formData.get("image") as File | null;
    const imagePublicId = formData.get("public_id");

    if (!name || !message) {
      throw new Error("Name and message are required");
    }

    const sql = neon(process.env.DATABASE_URL!);
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

  dayjs.extend(advancedFormat);

  const names = data.map(({ name }) => name);

  return (
    <div className={styles.page}>
      <Hearts names={names} />
      <div className={styles.main}>
        <div className={styles.title}>
          <div className={styles.halo}></div>
          <div className={styles.face}></div>
          <div className={styles.image}></div>
        </div>
        <ul className={styles["message-list"]}>
          {data.map(({ id, name, message, image_pub_id, created_at }) => {
            return (
              <li key={id}>
                {image_pub_id && (
                  <div className={styles.image}>
                    <CloudImage publicId={image_pub_id} />
                  </div>
                )}
                <div className={styles.texts}>
                  <p className={styles.message}>{message}</p>
                  <div className={styles.meta}>
                    <p className={styles.name}>{name}</p>
                    <p className={styles.date}>
                      {dayjs(created_at).format("MMM Do, YYYY")}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <footer className={styles.footer}>
          © {new Date().getFullYear()} Created with ❤️ by APAC Monks{" "}
        </footer>
      </div>
      <Form onSubmit={handleSubmit} />
    </div>
  );
}
