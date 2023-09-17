"use client";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "~/convex/_generated/api";
import { Content } from "~/ui";

const rnd = () => crypto.getRandomValues(new Uint32Array(1))[0].toString(32);
const getUserId = () => {
  let userId = localStorage.getItem("userId");
  if (userId) {
    return userId;
  }
  userId = rnd() + rnd();
  localStorage.setItem("userId", userId);
  return userId;
};

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient ? children : null;
}

export function ClientPollPage({
  pollId,
  isFramed,
}: {
  pollId: string;
  isFramed: boolean;
}) {
  const poll = useQuery(api.polls.get, { id: pollId });
  const userVote = useQuery(api.polls.getVote, { pollId, userId: getUserId() });
  const vote = useMutation(api.polls.vote);

  const [checked, setChecked] = useState<number[]>([]);

  useEffect(() => {
    if (userVote) {
      setChecked(userVote.optionIndexes);
    }
  }, [userVote]);

  if (!poll) {
    return null;
  }

  return (
    <Content>
      {!isFramed && (
        <h1 className="mb-8 text-2xl text-orange-500">
          <Link href="/">Powl</Link>
        </h1>
      )}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl">{poll.question}</h2>
        <div className="flex flex-col gap-2">
          {poll.options.map(({ text, votes }, i) => (
            <label
              key={i}
              className="border rounded p-2 flex flex-col gap-2 cursor-pointer"
            >
              <div className="flex flex-row gap-2">
                {poll.isMulti ? (
                  <input
                    type="checkbox"
                    name="option"
                    value={i}
                    className="p-2 cursor-pointer accent-orange-500"
                    checked={checked.includes(i)}
                    onChange={(event) => {
                      const newChecked = event.target.checked
                        ? checked.concat(i)
                        : checked.filter((c) => c !== i);
                      console.log(newChecked);
                      setChecked(newChecked);
                      vote({
                        pollId,
                        userId: getUserId(),
                        optionIndexes: newChecked,
                      });
                    }}
                  />
                ) : (
                  <input
                    type="radio"
                    name="option"
                    value={i}
                    className="p-2 cursor-pointer accent-orange-500"
                    defaultChecked={userVote?.optionIndexes.includes(i)}
                    onChange={(event) => {
                      vote({
                        pollId,
                        userId: getUserId(),
                        optionIndexes: event.target.checked ? [i] : [],
                      });
                    }}
                  />
                )}
                <div className="w-full flex flex-row gap-4 justify-between">
                  <div>{text}</div>
                  <div className="font-bold">{votes}</div>
                </div>
              </div>

              <div className="rounded w-full h-1 dark:bg-gray-700 bg-gray-300">
                <div
                  className="rounded h-full bg-orange-500"
                  style={{
                    width: `${
                      100 *
                      (votes / Math.max(...poll.options.map((o) => o.votes), 1))
                    }%`,
                    transition: "width 200ms linear",
                  }}
                />
              </div>
            </label>
          ))}
        </div>
      </div>
    </Content>
  );
}
