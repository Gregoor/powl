import Link from "next/link";

import { Content } from "~/ui";
import { Form } from "./Form";

export default function Home() {
  return (
    <Content>
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl">
            <Link href="/">Powl</Link>
          </h1>
          <h2 className="text-lg text-gray-500 dark:text-gray-300">
            Create polls with a <span className="text-orange-500">pow</span>
          </h2>
        </div>
        <Form />
      </div>
    </Content>
  );
}
