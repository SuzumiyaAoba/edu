import { Readable } from "node:stream";
import { bufferedAsyncIterator } from "@/libs/bufferable-iterator";
import { charGenerator } from "@/libs/char-generator";
import type { Definition, Expression } from "./grammar";

export const accept = <Meta = unknown>(
  definition: Definition<Meta>,
  input: string,
): boolean => {
  const readable = Readable.from(input);
  const charGen = charGenerator(readable);
  const iter = bufferedAsyncIterator(charGen);

  /*
  switch (expr.type) {
    case "Identifier":
      break;
    case "Literal":
      break;
    case "CharacterClass":
      break;
    case "AnyCharacter":
      break;
    case "Grouping":
      break;
    case "Optional":
      break;
    case "ZeroOrMore":
      break;
    case "OneOrMore":
      break;
    case "AndPredicate":
      break;
    case "NotPredicate":
      break;
    case "Sequence":
      break;
    case "PrioritizedChoice":
      break;
  }
   */

  return false;
};
