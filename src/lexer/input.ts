export type Input =
  | {
      type: "string";
      content: string;
    }
  | {
      type: "file";
      path: string;
    };

export const toReadable = async (input: Input): Promise<ReadableStream> => {
  switch (input.type) {
    case "string":
      return new ReadableStream({
        start(controller) {
          controller.enqueue(input.content);
          controller.close();
        },
      });
    case "file":
      return Bun.file(input.path).stream();
  }
};
