import { render, screen } from "@testing-library/react";
import UpcomingAppointments from "./upcoming-appointments";
import { vi } from "vitest";

vi.mock("@/lib/http", () => {
  return {
    http: () => ({
      get: vi.fn().mockResolvedValue({
        data: [
          {
            appt_id: 1,
            elder_id: 10,
            startDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            endDateTime: new Date(
              Date.now() + 2 * 60 * 60 * 1000
            ).toISOString(),
            details: "Checkup",
            name: "Doctor Visit",
            loc: "Clinic",
            accepted: "user-1",
            created_by: "user-1",
            declined: [],
          },
          {
            appt_id: 2,
            elder_id: 11,
            startDateTime: new Date(
              Date.now() + 3 * 60 * 60 * 1000
            ).toISOString(),
            endDateTime: new Date(
              Date.now() + 4 * 60 * 60 * 1000
            ).toISOString(),
            details: null,
            name: "Therapy",
            loc: "Home",
            accepted: null,
            created_by: "user-1",
            declined: [],
          },
        ],
      }),
    }),
  };
});

describe("UpcomingAppointments", () => {
  it("renders loading then list", async () => {
    render(
      <UpcomingAppointments elderNames={{ "10": "Ahmaaa", "11": "Ahgong" }} />
    );

    expect(
      screen.getByText(/Loading upcoming appointments/)
    ).toBeInTheDocument();

    await screen.findByText("Doctor Visit with Ahmaaa");
    expect(screen.getByText("Therapy with Ahgong")).toBeInTheDocument();
  });

  it("filters by my-appointments and by-elder", async () => {
    render(
      <UpcomingAppointments elderNames={{ "10": "Ahmaaa", "11": "Ahgong" }} />
    );

    await screen.findByText("Doctor Visit with Ahmaaa");

    screen.getByText("My Appointments").click();
    await screen.findByText(/Showing your accepted appointments/);
    expect(screen.getByText("Doctor Visit with Ahmaaa")).toBeInTheDocument();
    expect(screen.queryByText("Therapy with Ahgong")).not.toBeInTheDocument();

    // Reset to all
    screen.getByText("All").click();
    // Dropdown only shows when multiple elders present; assert label exists
    expect(screen.getByText("Select Elder")).toBeInTheDocument();
  });
});
