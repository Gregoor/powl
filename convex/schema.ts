import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  polls: defineTable({
    isMulti: v.boolean(),
    options: v.array(v.object({ text: v.string(), votes: v.number() })),
    question: v.string(),
  }),

  votes: defineTable({
    pollId: v.id("polls"),
    userId: v.string(),
    optionIndexes: v.array(v.number()),
  }).index("by_poll_user", ["pollId", "userId"]),
});
