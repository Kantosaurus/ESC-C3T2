import { renderHook, waitFor } from "@testing-library/react";
import { useTodayTasks } from "./use-today-tasks";
import { vi } from "vitest";

const today = new Date();
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

vi.mock("@/lib/http", () => {
  return {
    http: () => ({
      get: vi.fn().mockResolvedValue({
        data: [
          {
            appt_id: 1,
            elder_id: 10,
            startDateTime: today.toISOString(),
            endDateTime: new Date(
              today.getTime() + 60 * 60 * 1000
            ).toISOString(),
            details: null,
            name: "Today Accepted",
            loc: null,
            accepted: "user-1",
            created_by: "user-1",
            declined: [],
          },
          {
            appt_id: 2,
            elder_id: 10,
            startDateTime: today.toISOString(),
            endDateTime: new Date(
              today.getTime() + 2 * 60 * 60 * 1000
            ).toISOString(),
            details: null,
            name: "Today Not Accepted",
            loc: null,
            accepted: null,
            created_by: "user-1",
            declined: [],
          },
          {
            appt_id: 3,
            elder_id: 11,
            startDateTime: tomorrow.toISOString(),
            endDateTime: new Date(
              tomorrow.getTime() + 60 * 60 * 1000
            ).toISOString(),
            details: null,
            name: "Tomorrow Accepted",
            loc: null,
            accepted: "user-1",
            created_by: "user-1",
            declined: [],
          },
        ],
      }),
    }),
  };
});

describe("useTodayTasks", () => {
  it("counts only accepted appointments happening today", async () => {
    const { result } = renderHook(() => useTodayTasks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.todayTasks).toBe(1);
  });
});
