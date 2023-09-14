"use client";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/convex/_generated/api";
import { Button, Content } from "~/ui";

const Input = (props: React.ComponentProps<"input">) => (
  <input type="text" className="border rounded p-2 dark:bg-black" {...props} />
);

export default function Home() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isMulti, setIsMulti] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const createPoll = useMutation(api.polls.create);

  const router = useRouter();

  return (
    <Content>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={(event) => {
          event.preventDefault();

          setIsSaving(true);
          createPoll({
            question,
            options: options.filter(Boolean),
            isMulti,
          }).then((id) => {
            router.push(`/id/${id}`);
          });
        }}
      >
        <div>
          <h1 className="text-2xl">
            <Link href="/">Powl</Link>
          </h1>
          <h2 className="text-lg text-gray-500 dark:text-gray-300">
            Create polls with a <span className="text-orange-500">pow</span>
          </h2>
        </div>
        <Input
          placeholder="Question..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          required
        />
        {options.map((value, i) => (
          <Input
            key={i}
            placeholder={`Option ${i + 1}...`}
            value={value}
            onChange={(event) => {
              setOptions((options) => {
                options = options.slice();
                options.splice(i, 1, event.target.value);
                if (i === options.length - 1) {
                  options.push("");
                }
                return options;
              });
            }}
            required={i < 2 && options.filter(Boolean).length < 2}
          />
        ))}
        <div className="flex flex-row justify-end gap-2">
          <div className="flex flex-row items-center gap-1">
            <input
              type="checkbox"
              id="multi"
              checked={isMulti}
              onChange={(event) => setIsMulti(event.target.checked)}
            />
            <label htmlFor="multi">Allow multiple answers</label>
          </div>
          <Button primary type="submit" disabled={isSaving}>
            Pow
          </Button>
        </div>
      </form>
    </Content>
  );
}
