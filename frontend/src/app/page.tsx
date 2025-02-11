import { neon } from "@neondatabase/serverless";

type MessageEntryType = {
  id: number;
  name: string;
  message: string;
  date: string;
  imageUrl?: string;
};

async function getData() {
  const sql = neon(process.env.DATABASE_URL!);
  const response = await sql`SELECT * FROM love_for_keith`;
  console.log(response);

  return response as MessageEntryType[];
}

export default async function Page() {
  const data: MessageEntryType[] = await getData();
  return (
    <>
      {data.map(({ id, name }) => {
        return <div key={id}>{name}</div>;
      })}
    </>
  );
}
