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
import { useRouter } from "next/navigation";
import React, { useEffect, useId, useState } from "react";

import { api } from "~/convex/_generated/api";
import { Button } from "~/ui";
import { Pow } from "./Pow";

// eslint-disable-next-line react/display-name
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="text"
      className={cx("border rounded p-2 dark:bg-black", className)}
      {...props}
    />
  )
);

const DraggableInput = ({
  index,
  ...props
}: React.ComponentProps<"input"> & { index: number }) => {
  const id = useId();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { index },
    disabled: !props.value,
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
    <Input
      ref={setNodeRef as any}
      {...props}
      {...listeners}
      {...attributes}
      style={dragStyle}
    />
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
          "bg-orange-500"
      )}
    />
  );
}

export function Form() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isMulti, setIsMulti] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const createPoll = useMutation(api.polls.create);

  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
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
          options: options.filter(Boolean),
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
        <div className="mt-2 text-sm">Tip: You can drag to sort options</div>
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
                  options[active.index]
                )
            );
          }}
        >
          <Droppable index={0} />
          {options.map((value, i) => [
            <DraggableInput
              key={i + "input"}
              index={i}
              className="cursor-text"
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
            />,
            <Droppable key={i + "droppable"} index={i + 1} disabled={!value} />,
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
