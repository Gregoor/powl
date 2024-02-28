import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { optionValue } from "./schema";

export const create = mutation({
  args: {
    question: v.string(),
    isMulti: v.boolean(),
    options: v.array(optionValue),
  },
  handler: ({ db }, args) =>
    db.insert("polls", {
      ...args,
      options: args.options.map((value) => ({ value, votes: 0 })),
    }),
});

export const get = query({
  args: { id: v.string() },
  handler: ({ db }, { id }) => db.get(id as Id<"polls">),
});

export const vote = mutation({
  args: {
    pollId: v.string(),
    userId: v.string(),
    optionIndexes: v.array(v.number()),
  },
  async handler({ db }, { userId, ...args }) {
    const pollId = args.pollId as Id<"polls">;
    const poll = await db.get(pollId);
    if (!poll) {
      return;
    }

    const prevVote = await db
      .query("votes")
      .withIndex("by_poll_user", (q) =>
        q.eq("pollId", pollId).eq("userId", userId),
      )
      .unique();

    const voteData = { ...args, userId, pollId };
    await (prevVote
      ? db.replace(prevVote._id, voteData)
      : db.insert("votes", voteData));

    await db.patch(pollId, {
      options: poll.options.map(({ value, votes }, i) => ({
        value,
        votes:
          votes +
          (prevVote?.optionIndexes.includes(i) ? -1 : 0) +
          (args.optionIndexes.includes(i) ? 1 : 0),
      })),
    });
  },
});

export const getVote = query({
  args: { pollId: v.string(), userId: v.string() },
  handler: ({ db }, { pollId, userId }) =>
    db
      .query("votes")
      .withIndex("by_poll_user", (q) =>
        q.eq("pollId", pollId as Id<"polls">).eq("userId", userId),
      )
      .unique(),
});
