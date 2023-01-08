import { useState } from "react";
import { object, string } from "zod";
import { trpc } from "../utils/trpc";

export const tweetSchema = object({
  text: string({ required_error: "Tweet text is required" }).min(10).max(280),
});

const CreateTweet = () => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const utils = trpc.useContext();
  const { mutateAsync } = trpc.tweet.create.useMutation({
    onSuccess: () => {
      setText("");
      utils.tweet.timeline.invalidate();
    },
  });

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await tweetSchema.parse({ text });
    } catch (error: unknown) {
      setError(error.message);
      return;
    }

    mutateAsync({ text });
  };

  return (
    <>
      {error && JSON.stringify(error)}
      <form
        className="mb-4 flex w-full flex-col rounded-md border-2 p-4"
        onSubmit={handleSubmit}
      >
        <textarea
          className="w-full p-4 shadow"
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-white"
          >
            Tweet
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateTweet;
