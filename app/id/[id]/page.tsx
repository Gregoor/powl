import fs from "fs";

import { headers } from "next/headers";

import { ClientOnly, ClientPollPage } from "./ClientPage";

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
