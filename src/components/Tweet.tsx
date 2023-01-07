import Image from "next/image";
import Link from "next/link";
import { AiFillHeart } from "react-icons/ai";
import { type InfiniteData, type QueryClient } from "@tanstack/react-query";
import { type RouterOutputs, trpc, type RouterInputs } from "../utils/trpc";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "a month",
    MM: "%d months",
    y: "1y",
    yy: "%dy",
  },
});

const updateCache = ({
  action,
  client,
  data,
  input,
  variables,
}: {
  action: "like" | "unlike";
  client: QueryClient;
  data: {
    userId: string;
  };
  input: RouterInputs["tweet"]["timeline"];
  variables: {
    tweetId: string;
  };
}) => {
  client.setQueryData(
    [["tweet", "timeline"], { input, type: "infinite" }],
    (oldData) => {
      const newData = oldData as InfiniteData<
        RouterOutputs["tweet"]["timeline"]
      >;

      const likeValue = action === "like" ? 1 : -1;

      const newTweets = newData.pages.map((page) => ({
        tweets: page.tweets.map((tweet) => {
          if (tweet.id === variables.tweetId) {
            return {
              ...tweet,
              likes: action === "like" ? [data.userId] : [],
              _count: { likes: tweet._count.likes + likeValue },
            };
          }

          return tweet;
        }),
      }));

      return { ...newData, pages: newTweets };
    }
  );
};

const Tweet = ({
  tweet,
  input,
  client,
}: {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
  input: RouterInputs["tweet"]["timeline"];
  client: QueryClient;
}) => {
  const likeMutation = trpc.tweet.like.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ action: "like", client, data, input, variables });
    },
  }).mutateAsync;

  const unlikeMutation = trpc.tweet.unlike.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ action: "unlike", client, data, input, variables });
    },
  }).mutateAsync;

  const hasLiked = tweet.likes.length > 0;

  return (
    <div className="mb-4 border-b-2 border-gray-500">
      <div className="flex p-2">
        {tweet.author.image && (
          <div>
            <Image
              src={tweet.author.image}
              alt={`${tweet.author.name} profile picture`}
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
        )}

        <div className="ml-2 ">
          <div className="flex items-center">
            <p className="font-bold">
              <Link href={`/${tweet.author.name}`}>{tweet.author.name}</Link>
            </p>
            <p className="pl-1 text-xs text-gray-500">
              {" "}
              — {dayjs(tweet.createdAt).fromNow()}
            </p>
          </div>

          <div>{tweet.text}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center p-2">
        <AiFillHeart
          color={hasLiked ? "red" : "gray"}
          size="1.5rem"
          onClick={() => {
            if (hasLiked) {
              unlikeMutation({
                tweetId: tweet.id,
              });
              return;
            }

            likeMutation({
              tweetId: tweet.id,
            });
          }}
        />

        <span className="text-sm text-gray-500">{tweet._count.likes}</span>
      </div>
    </div>
  );
};

export default Tweet;
