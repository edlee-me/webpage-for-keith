export type MessageEntryType = {
  id: number;
  name: string;
  message: string;
  date: string;
  imageurl?: string;
  created_at: string;
  image_pub_id?: string;
};

// types.ts
export interface CircleBody extends Matter.Body {
  render: {
    fillStyle: string;
    text: string;
    textColor: string;
  };
}