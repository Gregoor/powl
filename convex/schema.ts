import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const optionValue = v.object({
  type: v.union(v.literal("text"), v.literal("datetime")),
  value: v.string(),
});
export type OptionValue = Infer<typeof optionValue>;

export default defineSchema({
  polls: defineTable({
    question: v.string(),
    isMulti: v.boolean(),
    options: v.array(
      v.object({
        text: v.optional(v.string()),
        value: optionValue,
        votes: v.number(),
      }),
    ),
  }),

  votes: defineTable({
    pollId: v.id("polls"),
    userId: v.string(),
    optionIndexes: v.array(v.number()),
  }).index("by_poll_user", ["pollId", "userId"]),
});
