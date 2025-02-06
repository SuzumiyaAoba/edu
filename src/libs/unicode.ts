import {
  type Readable,
  Transform,
  type TransformCallback,
  type TransformOptions,
} from "node:stream";
import { graphemeSegments } from "unicode-segmenter/grapheme";

export class GraphemeStream extends Transform {
  #buffer: string;

  constructor(options?: TransformOptions) {
    super(options);
    this.#buffer = "";
  }

  override _transform(
    chunk: Buffer | string,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    this.#buffer += chunk.toString();
    let lastIndex = 0;

    for (const { segment, index } of graphemeSegments(this.#buffer)) {
      this.push(segment);
      lastIndex = index + segment.length;
    }

    this.#buffer = this.#buffer.slice(lastIndex);
    callback();
  }

  override _flush(callback: TransformCallback): void {
    if (this.#buffer) {
      for (const { segment } of graphemeSegments(this.#buffer)) {
        this.push(segment);
      }
    }
    callback();
  }
}

export const bufferToGraphemes = (buffer: Buffer) => {
  const text = buffer.toString("utf8");

  const graphemes = [...graphemeSegments(text)].map(
    (segment) => segment.segment,
  );

  return graphemes;
};

export const graphemesGenerator = async function* (readable: Readable) {
  const stream = readable.pipe(new GraphemeStream());
  for await (const chunk of stream.iterator()) {
    for (const c of bufferToGraphemes(chunk.toString())) {
      yield c;
    }
  }
};
