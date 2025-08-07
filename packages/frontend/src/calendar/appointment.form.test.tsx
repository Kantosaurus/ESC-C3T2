import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppointmentForm } from "./appointment.form.tsx";
import { useCreateAppointment } from "./use-appointment.ts";

vi.mock("./use-appointment.ts", async () => ({
  ...(await vi.importActual("./use-appointment.ts")),
  useCreateAppointment: vi.fn(),
}));

describe("AppointmentForm", () => {
  const mockCreate = vi.fn().mockResolvedValue({ success: true });
  vi.mocked(useCreateAppointment).mockReturnValue(mockCreate);
  const mockOnSubmit = vi.fn(async (values) => {
    await mockCreate(values);
  });
  const selectedDate = new Date("2025-08-06T00:00:00.000Z");
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default values", () => {
    render(
      <AppointmentForm
        elder_id={1}
        elder_name="Ryan Teo"
        selectedDate={selectedDate}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("New Appointment")).toBeInTheDocument();
    expect(
      screen.getByText("Schedule an appointment for Ryan Teo")
    ).toBeInTheDocument();
    expect(screen.getByText(/Wednesday, August 6, 2025/i)).toBeInTheDocument();
  });

  it("allows typing into title and description and calls onSubmit with correct values", async () => {
    render(
      <AppointmentForm
        elder_id={1}
        elder_name="Ryan Teo"
        selectedDate={selectedDate}
        onSubmit={mockOnSubmit}
      />
    );

    await userEvent.type(
      screen.getByPlaceholderText(/Doctor Visit, Therapy Session/i),
      "Dentist Appointment"
    );

    await userEvent.type(
      screen.getByPlaceholderText(/Additional notes or details/i),
      "Checkup at KTPH"
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Create Appointment/i })
    );

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);

      const submittedData = mockCreate.mock.calls[0]?.[0];
      expect(submittedData!.name).toBe("Dentist Appointment");
      expect(submittedData!.details).toBe("Checkup at KTPH");
    });
  });

  it("shows validation error when title is empty", async () => {
    render(
      <AppointmentForm
        elder_id={1}
        elder_name="Ryan Teo"
        selectedDate={selectedDate}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Create Appointment/i })
    );

    expect(
      await screen.findByText("Appointment must have a name")
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
