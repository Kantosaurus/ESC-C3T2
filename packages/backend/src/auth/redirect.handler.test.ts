import { Request, Response } from "express";
import { describe, expect, test, vi } from "vitest";
import { redirectHandler } from "./redirect.handler";

vi.mock("./singpass/client", () => ({
  singpassClient: {
    callback: async () => {
      return {
        sub: "123",
      };
    },
  },
}));

vi.mock("./session", () => ({
  sessionData: {
    someSessionId: {
      codeVerifier: "someCodeVerifier",
      nonce: "someNonce",
    },
  },
}));

// Top down integration tests for redirectHandler
describe("redirect.handler integration tests", () => {
  test("should redirect to frontend with token", async () => {
    const mockRequest = {
      query: {
        code: "someCode",
        state: new URLSearchParams("sessionId=someSessionId&after=/home"),
      },
    } as unknown as Request;

    const mockResponse = {
      redirect: vi.fn(),
    } as unknown as Response;

    await redirectHandler(mockRequest, mockResponse, vi.fn());

    expect(mockResponse.redirect).toHaveBeenCalledWith(
      expect.stringContaining("/redirect")
    );

    expect(mockResponse.redirect).toHaveBeenCalledWith(
      expect.stringContaining("token=")
    );

    expect(mockResponse.redirect).toHaveBeenCalledWith(
      expect.stringContaining("after=%2Fhome")
    );
  });

  test("should redirect to error page if code verifier is not present in session table", async () => {
    const mockRequest = {
      query: {
        code: "someCode",
        state: new URLSearchParams("sessionId=otherSessionId&after=/home"),
      },
    } as unknown as Request;

    const mockResponse = {
      redirect: vi.fn(),
    } as unknown as Response;

    await redirectHandler(mockRequest, mockResponse, vi.fn());

    expect(mockResponse.redirect).toHaveBeenCalledWith(
      expect.stringContaining("/error")
    );
  });

  test("should redirect to error page if authCode is missing", async () => {
    const mockRequest = {
      query: {
        state: new URLSearchParams("sessionId=otherSessionId&after=/home"),
      },
    } as unknown as Request;

    const mockResponse = {
      redirect: vi.fn(),
    } as unknown as Response;

    await redirectHandler(mockRequest, mockResponse, vi.fn());

    expect(mockResponse.redirect).toHaveBeenCalledWith(
      expect.stringContaining("/error")
    );
  });

  test("should redirect to error page if sessionId is missing", async () => {
    const mockRequest = {
      query: {
        code: "someCode",
        state: new URLSearchParams(),
      },
    } as unknown as Request;

    const mockResponse = {
      redirect: vi.fn(),
    } as unknown as Response;

    await redirectHandler(mockRequest, mockResponse, vi.fn());

    expect(mockResponse.redirect).toHaveBeenCalledWith(
      expect.stringContaining("/error")
    );
  });
});
