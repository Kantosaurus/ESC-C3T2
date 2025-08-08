import { describe, expect, it, vi } from "vitest";
import { authenticated, Authenticated } from "./guard";
import { Request, RequestHandler, Response } from "express";

describe("Auth Guard", async () => {
  const makeTestHandler = () => {
    return (async (req, res) => {
      res.status(200).json({ message: "Success" });
    }) as Authenticated<RequestHandler>;
  };
  it("should function as wrapped handler if authentciation locals are present", async () => {
    const authenticatedHandler = authenticated(makeTestHandler());
    const req = {} as Request;
    const jsonFn = vi.fn();
    const statusFn = vi.fn().mockReturnValue({
      json: jsonFn,
    });
    const res = {
      locals: {
        user: {
          userId: "123",
        },
      },
      status: statusFn,
    } as unknown as Response;
    const next = vi.fn();

    await authenticatedHandler(req, res, next);
    expect(statusFn).toHaveBeenCalledWith(200);
    expect(jsonFn).toHaveBeenCalledWith({ message: "Success" });
  });

  it("should throw an error if authentication locals are not present", async () => {
    const authenticatedHandler = authenticated(makeTestHandler());
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();

    await expect(async () => {
      await authenticatedHandler(req, res, next);
    }).rejects.toThrowError();
  });
});
