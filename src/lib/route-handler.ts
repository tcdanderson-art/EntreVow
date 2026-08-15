import { NextResponse } from "next/server";

// Throw from inside a route handler (or a transaction() callback) to return a
// specific status/message instead of the generic 500 below — e.g. a business
// rule violation discovered mid-transaction, where returning a NextResponse
// directly isn't an option because the transaction still needs to roll back.
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}
