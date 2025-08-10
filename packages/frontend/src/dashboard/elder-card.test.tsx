import { render, screen } from "@testing-library/react";
import { ElderCard } from "./elder-card";
import type { Elder } from "@carely/core";
import { vi } from "vitest";

const baseElder: Elder = {
  id: 1,
  name: "Ahmaaa",
  date_of_birth: new Date("1940-05-21"),
  gender: "female",
  phone: null,
  bio: null,
  profile_picture: null,
  created_at: new Date(),
  updated_at: new Date(),
  street_address: "Block 123, Bedok",
  unit_number: null,
  postal_code: null,
  latitude: null,
  longitude: null,
};

describe("ElderCard", () => {
  it("renders elder name and address", () => {
    render(<ElderCard elder={baseElder} />);

    expect(screen.getByText("Ahmaaa")).toBeInTheDocument();
    expect(screen.getByText(/Bedok/)).toBeInTheDocument();
  });

  it("invokes onClick when provided", () => {
    const onClick = vi.fn();
    render(<ElderCard elder={baseElder} onClick={onClick} />);

    screen.getByText("Ahmaaa").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
