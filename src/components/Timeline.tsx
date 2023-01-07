import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { type RouterInputs, trpc } from "../utils/trpc";
import CreateTweet from "./CreateTweet";
import Tweet from "./Tweet";

const LIMIT = 10;

const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  function handleScroll() {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    const scrolled = (winScroll / height) * 100;

    setScrollPosition(scrolled);
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
};

const Timeline = ({
  where = {},
}: {
  where: RouterInputs["tweet"]["timeline"]["where"];
}) => {
  const { data, fetchNextPage, hasNextPage, isFetching } =
    trpc.tweet.timeline.useInfiniteQuery(
      { limit: LIMIT, where },
      { getNextPageParam: (lastpage) => lastpage.nextCursor }
    );

  const scrollPosition = useScrollPosition();

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  const client = useQueryClient();

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetching, scrollPosition]);

  return (
    <div className="mb-24">
      <CreateTweet />

      <div className="border-2 border-gray-500">
        {tweets.map((tweet) => (
          <Tweet
            key={tweet.id}
            tweet={tweet}
            client={client}
            input={{
              limit: LIMIT,
              where,
            }}
          />
        ))}

        {!hasNextPage && <p>No more tweets to load</p>}
      </div>
    </div>
  );
};

export default Timeline;
