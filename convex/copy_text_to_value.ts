import { mutation } from "./_generated/server";

export const copyTextToValue = mutation({
  handler: async ({ db }) => {
    const polls = await db.query("polls").collect();
    for (const poll of polls) {
      db.patch(poll._id, {
        options: poll.options.map((option) => ({
          ...option,
          value: { type: "text", value: option.text } as const,
        })),
      });
    }
  },
});
