import { render, screen, fireEvent } from "@testing-library/react";
import { it, describe, expect } from "vitest";
import userEvent from "@testing-library/user-event";
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
    expect(screen.getByText("Ryan Teo")).toBeInTheDocument();
    screen.debug();
  });
});

//Dayview side bar should render
describe("Celendarcell on click", () => {
  it("should render the dayview when clicked", async () => {
    vi.setSystemTime(new Date("2025-08-05"));
    render(<Calendarview />);
    const dayCell = screen.getByText("1");
    fireEvent.click(dayCell);
    expect(screen.getByText("Add Appointment")).toBeInTheDocument();
    expect(screen.getByText("Fri Aug 01 2025"));
  });
});

//Create appointment form should render
describe("Create appointment form", () => {
  it("should render appointmeent form", async () => {
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
    const dayCell = screen.getByText("1");
    fireEvent.click(dayCell);
    const addappointment = screen.getByText("Add Appointment");
    fireEvent.click(addappointment);
    expect(screen.getByText("New Appointment")).toBeInTheDocument();
    expect(
      screen.getByText("Schedule an appointment for Ryan Teo")
    ).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(
      /e\.g\., Doctor Visit, Therapy Session/i
    );
    expect(titleInput).toBeInTheDocument();

    //Simultate typing within the title field
    await userEvent.type(titleInput, "Dentist Appointment");
    expect(titleInput).toHaveValue("Dentist Appointment");
    screen.debug();
  });
});

//Today button and prev/next button should work
describe("calendar navigation", () => {
  it("should", () => {
    vi.setSystemTime(new Date("2025-08-05"));
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
    expect(screen.getByText("August 2025")).toBeInTheDocument();
    const nextButton = screen.getByTestId("next-month-button");
    const prevButton = screen.getByTestId("prev-month-button");
    const todayButton = screen.getByTestId("today-button");
    fireEvent.click(prevButton);
    expect(screen.getByText("July 2025")).toBeInTheDocument();
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    expect(screen.getByText("September 2025")).toBeInTheDocument();
    fireEvent.click(todayButton);
    expect(screen.getByText("August 2025")).toBeInTheDocument();
  });
});
