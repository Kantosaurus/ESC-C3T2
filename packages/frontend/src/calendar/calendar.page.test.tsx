import { render, screen } from "@testing-library/react";
import { it, describe } from "vitest";

import { vi } from "vitest";
import { useEldersDetails } from "../elder/use-elder-details";
import type { Elder } from "../../../core/src/elder/elder.schema";
import Calendarview from "./calendar.page";

vi.mock("@/elder/use-elder-details", () => ({
  useEldersDetails: vi.fn(() => ({ elderDetails: [] })),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const mockElders = (elders: Elder[]) => {
  vi.mocked(useEldersDetails).mockReturnValue({
    elderDetails: elders,
    error: undefined,
    isLoading: false,
    refetch: vi.fn(),
  });
};

//Mock An Elder within the database. Calendar should show which elder the calendar belong to
describe("Calendar", () => {
  it("should render elder's name when elder is chosen", () => {
    mockElders([
      {
        id: 1,
        name: "Ryan Teo",
        date_of_birth: new Date("2000-01-01"),
        phone: undefined,
        gender: "male",
        created_at: new Date("2000-01-01"),
        updated_at: new Date("2000-01-01"),
      } as unknown as Elder,
    ]);

    render(<Calendarview />);
    screen.debug();
  });
});
