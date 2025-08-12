import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";
import { vi } from "vitest";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={<span data-testid="icon">i</span>}
        title="No elders yet"
        description="Start by adding your first elder"
      />
    );

    expect(screen.getByText("No elders yet")).toBeInTheDocument();
    expect(
      screen.getByText("Start by adding your first elder")
    ).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders action button and fires handler", () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        icon={<span />}
        title="Empty"
        description="desc"
        actionLabel="Add"
        onAction={onAction}
      />
    );

    screen.getByText("Add").click();
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
