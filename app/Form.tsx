"use client";

import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import cx from "classnames";
import { useMutation } from "convex/react";
import { CalendarIcon, WholeWordIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useId, useMemo, useState } from "react";
import { equals, sortBy } from "remeda";

import { api } from "~/convex/_generated/api";
import { OptionValue } from "~/convex/schema";
import { Button } from "~/ui";

import { Pow } from "./Pow";

// eslint-disable-next-line react/display-name
const Input = ({ className, ...props }: React.ComponentProps<"input">) => (
  <input
    type="text"
    className={cx("border rounded p-2 leading-none dark:bg-black", className)}
    {...props}
  />
);

const OptionInput = ({
  index,
  option,
  onChange,
  required,
}: {
  index: number;
  option: OptionValue;
  onChange: (option: OptionValue) => void;
  required?: boolean;
}) => {
  const id = useId();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { index },
    disabled: !option.value,
  });

  const dragStyle = transform
    ? {
        zIndex: 30,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        cursor: "move",
        opacity: 0.5,
      }
    : undefined;
  return (
    <div
      ref={setNodeRef as any}
      className="flex flex-row"
      {...listeners}
      {...attributes}
      style={dragStyle}
    >
      <button
        type="button"
        className="border border-r-0 rounded-l p-2 dark:bg-black"
        onClick={() => {
          onChange(
            option.type == "text"
              ? {
                  type: "datetime",
                  value: new Date().toISOString().slice(0, -8),
                }
              : { type: "text", value: "" },
          );
        }}
      >
        {React.createElement(
          option.type == "text" ? WholeWordIcon : CalendarIcon,
          { size: 18, className: "stroke-gray-600" },
        )}
      </button>
      <Input
        type={option.type === "datetime" ? "datetime-local" : "text"}
        placeholder={`Option ${index + 1}...`}
        className="rounded-l-none w-full cursor-text"
        value={option.value}
        onChange={(event) =>
          onChange({ type: option.type, value: event.target.value })
        }
        required={required}
      />
    </div>
  );
};

function Droppable({ index, disabled }: { index: number; disabled?: boolean }) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: index,
    data: { index },
    disabled,
  });
  const activeIndex = active?.data.current?.index;

  return (
    <div
      ref={setNodeRef}
      className={cx(
        "my-0.5 w-full h-0.5",
        isOver &&
          activeIndex !== index &&
          activeIndex + 1 !== index &&
          "bg-orange-500",
      )}
    />
  );
}

export function Form() {
  const [question, setQuestion] = useState("");
  const [isMulti, setIsMulti] = useState(false);

  const [options, setOptions] = useState<OptionValue[]>([
    { type: "text", value: "" },
    { type: "text", value: "" },
  ]);
  const sortedOptions = useMemo(
    () =>
      sortBy(
        options,
        (o) => o.type != "datetime",
        (o) =>
          o.type == "datetime"
            ? new Date(o.value).getTime()
            : options.indexOf(o),
      ),
    [options],
  );

  const [isSaving, setIsSaving] = useState(false);
  const createPoll = useMutation(api.polls.create);

  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) {
    return null;
  }

  return (
    <form
      className="flex flex-col gap-4 w-full"
      onSubmit={(event) => {
        event.preventDefault();

        setIsSaving(true);
        createPoll({
          question,
          options: options.filter((o) => o.value.trim()),
          isMulti,
        }).then((id) => {
          router.push(`/id/${id}`);
        });
      }}
    >
      {isSaving && <Pow />}

      <div className="flex flex-col gap-1">
        <Input
          placeholder="Question..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          required
        />
        <div className="mt-2 text-sm">
          Tip: You can drag options to re-order them
          {!equals(options, sortedOptions) && (
            <>
              {" "}
              (
              <button
                type="button"
                className="underline"
                onClick={() => setOptions(sortedOptions)}
              >
                click here to sort by time
              </button>
              )
            </>
          )}
        </div>
        <DndContext
          sensors={sensors}
          onDragEnd={(event) => {
            const over = event.over?.data.current as { index: number };
            const active = event.active.data.current as { index: number };
            if (!over || !active || over.index == active.index) return;
            const to = Math.min(over.index, options.length - 1);
            setOptions(
              options
                .toSpliced(active.index, 1)
                .toSpliced(
                  to > active.index ? to - 1 : to,
                  0,
                  options[active.index],
                ),
            );
          }}
        >
          <Droppable index={0} />
          {options.map((option, i) => [
            <OptionInput
              key={i + "input"}
              index={i}
              option={option}
              onChange={(option) => {
                setOptions((options) => {
                  options = options.slice();
                  options.splice(i, 1, option);
                  if (i === options.length - 1) {
                    options.push({ type: "text", value: "" });
                  }
                  return options;
                });
              }}
              required={i < 2 && options.filter(Boolean).length < 2}
            />,
            <Droppable
              key={i + "droppable"}
              index={i + 1}
              disabled={!option}
            />,
          ])}
        </DndContext>
      </div>
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
  );
}
