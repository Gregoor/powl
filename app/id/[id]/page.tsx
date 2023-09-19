import fs from "fs";

import { headers } from "next/headers";

import { ClientOnly, ClientPollPage } from "./ClientPage";

// Workaround: Read oembed file so that Vercel serves it
fs.readFileSync("public/.well-known/oembed.json");

export default function PollPage({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <ClientOnly>
      <ClientPollPage
        pollId={id}
        isFramed={headers().get("Sec-Fetch-Dest") == "iframe"}
      />
    </ClientOnly>
  );
}
