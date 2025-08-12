import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "./dashboard.page";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/nav/navbar", () => ({ default: () => <div /> }));

vi.mock("@/caregiver/use-caregiver", () => ({
  useCaregiver: () => ({
    caregiverDetails: { id: "user-1", name: "Jane Doe" },
  }),
}));

vi.mock("@/elder/use-elder-details", async () => {
  const actual = await vi.importActual("@/elder/use-elder-details");
  return {
    ...actual,
    useEldersDetails: () => ({
      elderDetails: [
        {
          id: 10,
          name: "Ahmaaa",
          date_of_birth: new Date("1940-05-21"),
          gender: "female",
          phone: null,
          bio: null,
          profile_picture: null,
          created_at: new Date(),
          updated_at: new Date(),
          street_address: "Block 123",
          unit_number: null,
          postal_code: null,
          latitude: null,
          longitude: null,
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    }),
  };
});

vi.mock("./use-today-tasks", () => ({
  useTodayTasks: () => ({ todayTasks: 2, isLoading: false }),
}));

vi.mock("./upcoming-appointments", () => ({
  __esModule: true,
  default: ({ elderNames }: { elderNames?: Record<string, string> }) => (
    <div data-testid="upcoming-appointments">
      UA: {elderNames ? Object.keys(elderNames).length : 0}
    </div>
  ),
}));

describe("DashboardPage", () => {
  it("renders greeting, stats and elder list", async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Good/)).toBeInTheDocument();
    });

    expect(screen.getByText("Total Elders")).toBeInTheDocument();
    expect(screen.getByText("Today's Tasks")).toBeInTheDocument();
    // Care Status appears in multiple places (summary card and elder card), ensure at least one exists
    expect(screen.getAllByText("Care Status").length).toBeGreaterThan(0);
    expect(screen.getByText("Elders Under Your Care")).toBeInTheDocument();
    expect(screen.getByText("Ahmaaa")).toBeInTheDocument();
    expect(screen.getByTestId("upcoming-appointments")).toBeInTheDocument();
  });
});
