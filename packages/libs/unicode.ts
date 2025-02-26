import { graphemeSegments } from "unicode-segmenter/grapheme";

export class GraphemeStream extends TransformStream<Uint8Array, string> {
  constructor() {
    let buffer = "";

    super({
      transform(chunk, controller) {
        buffer += new TextDecoder().decode(chunk);
        let lastIndex = 0;

        for (const { segment, index } of graphemeSegments(buffer)) {
          controller.enqueue(segment);
          lastIndex = index + segment.length;
        }

        buffer = buffer.slice(lastIndex);
      },
    });
  }
}

export const bufferToGraphemes = (buffer: Buffer) => {
  const text = buffer.toString("utf8");

  const graphemes = [...graphemeSegments(text)].map(({ segment }) => segment);

  return graphemes;
};

export const graphemesGenerator = async function* (
  readableStream: ReadableStream<Uint8Array>,
) {
  // see: https://github.com/oven-sh/bun/issues/8765
  const stream = readableStream.pipeThrough(
    new GraphemeStream(),
  ) as unknown as AsyncIterable<string, void, unknown>;
  for await (const chunk of stream) {
    for (const c of chunk) {
      yield c;
    }
  }
};
