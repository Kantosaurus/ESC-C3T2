import { render, screen, fireEvent } from "@testing-library/react";
import { it, describe, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { useEldersDetails } from "../elder/use-elder-details";
import type { Elder } from "../../../core/src/elder/elder.schema";
import Calendarview from "./calendar.page";
import { useGetAppointments } from "./use-appointment";
import type { Appointment } from "../../../core/src/appointment/appointment.schema";
import type { CalendarCellProps } from "@/components/ui/calendarcells";

vi.mock("@/elder/use-elder-details", () => ({
  useEldersDetails: vi.fn(() => ({ elderDetails: [] })),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ elder_id: undefined, appt_id: undefined }),
}));

const mockElders = (elders: Elder[]) => {
  vi.mocked(useEldersDetails).mockReturnValue({
    elderDetails: elders,
    error: undefined,
    isLoading: false,
    refetch: vi.fn(),
  });
};

vi.mock("./use-appointment", () => ({
  useGetAppointments: vi.fn(() => ({
    appointments: [],
    error: undefined,
    isLoading: false,
    refetch: vi.fn(),
  })),
  useCreateAppointment: vi.fn(() => vi.fn(() => Promise.resolve({}))),
  useDeleteAppointment: vi.fn(() => vi.fn(() => Promise.resolve())),
  useUpdateAppointment: vi.fn(() => vi.fn(() => Promise.resolve())),
  useGetAppointment: vi.fn(() => ({
    appointment: null,
    error: undefined,
    isLoading: false,
  })),
  useGetDeclinedAppointments: vi.fn(() => ({
    declined: [],
    error: undefined,
    isLoading: false,
    refetchAppointment: vi.fn(),
  })),
  useAcceptAppointment: vi.fn(() => vi.fn(() => Promise.resolve())),
  useDeclineAppointment: vi.fn(() => vi.fn(() => Promise.resolve())),
  useGetPendingAppointments: vi.fn(() => ({
    appointments: [],
    error: undefined,
    isLoading: false,
    refetchPending: vi.fn(),
  })),
  useGetCaregiver: vi.fn(() => ({
    caregiver: null,
    error: undefined,
    isLoading: false,
    refetchPending: vi.fn(),
  })),
}));

const stableAppointmentsReturn: ReturnType<typeof useGetAppointments> = {
  appointments: [],
  error: undefined,
  isLoading: false,
  refetch: vi.fn(),
};

const mockAppointments = (appointments: Appointment[]) => {
  stableAppointmentsReturn.appointments = appointments;
  vi.mocked(useGetAppointments).mockReturnValue(stableAppointmentsReturn);
};

//Mock calendar bar
vi.mock("./calendarbar", () => ({
  default: ({ goToToday }: { goToToday: () => void }) => (
    <div data-testid="calendar-bar">
      <button data-testid="today-button" onClick={goToToday}>
        Today
      </button>
    </div>
  ),
}));

//Mock calendar cells
vi.mock("@/components/ui/calendarcells", () => ({
  CalendarCell: ({
    children,
    onClick,
    variant,
    hasEvent,
    ...props
  }: CalendarCellProps) => (
    <div
      data-testid={`calendar-cell-${children}`}
      onClick={onClick}
      className={`calendar-cell ${variant} ${hasEvent ? "has-event" : ""}`}
      {...props}
    >
      {children}
    </div>
  ),
}));

//Calendar should render the appointment if the elder and appointment exists
describe("Calendarview should show appointment", () => {
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
    mockAppointments([
      {
        appt_id: 1,
        elder_id: 1,
        name: "Doctor Visit",
        startDateTime: new Date("2025-08-06T07:00:00.000Z"),
        endDateTime: new Date("2025-08-06T08:00:00.000Z"),
        details: "Annual health check",
        created_by: "1",
        declined: [],
      } as unknown as Appointment,
    ]);

    render(<Calendarview />);
    expect(screen.getByText("Ryan Teo")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("calendar-cell-6"));
    expect(screen.getByText("Doctor Visit")).toBeInTheDocument();
  });
});

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
    expect(screen.getByText("Fri Aug 01 2025")).toBeInTheDocument();
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
  });
});

//Today button and prev/next button should work
describe("calendar navigation", () => {
  it("previous/next month button and today button should correctly navigate", () => {
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
