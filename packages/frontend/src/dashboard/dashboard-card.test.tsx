import { render, screen } from "@testing-library/react";
import { DashboardCard } from "./dashboard-card";
import { vi } from "vitest";

describe("DashboardCard", () => {
  it("renders title, value and icon", () => {
    render(
      <DashboardCard
        title="Total Elders"
        value={3}
        icon={<span data-testid="icon">*</span>}
      />
    );

    expect(screen.getByText("Total Elders")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("calls onClick when provided", async () => {
    const onClick = vi.fn();
    render(
      <DashboardCard
        title="Clickable"
        value={1}
        icon={<span />}
        onClick={onClick}
      />
    );

    screen.getByText("Clickable").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
