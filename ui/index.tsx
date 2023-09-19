export const Content = ({
  className,
  isFramed,
  ...props
}: React.ComponentProps<"div"> & { isFramed?: boolean }) => (
  <main
    className={
      "flex min-h-screen flex-col items-center justify-center md:justify-between dark:bg-black dark:text-white " +
      (isFramed ? "" : "p-4 md:p-24")
    }
  >
    <div className={"w-full max-w-3xl " + className} {...props} />
  </main>
);

export const Button = ({
  primary,
  className,
  ...props
}: { primary?: boolean } & React.ComponentProps<"button">) => (
  <button
    className={
      `border rounded px-4 py-2 ${className || ""}` +
      (primary ? "border-transparent bg-orange-500 text-white" : "")
    }
    {...props}
  />
);
