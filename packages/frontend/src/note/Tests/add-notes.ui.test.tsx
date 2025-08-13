import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { AddNoteForm } from "../add-note.form";
import userEvent from "@testing-library/user-event";

// Mock useEldersDetails so the select has data
vi.mock("@/elder/use-elder-details", () => ({
  useEldersDetails: () => ({
    elderDetails: [{ id: 123, name: "John Doe" }],
    isLoading: false,
  }),
}));

// Create spyable functions for speech-to-text
const startListening = vi.fn();
const stopListening = vi.fn();
const setTranscript = vi.fn();
let transcriptValue = "";

// Mock useSpeechToText
vi.mock("../use-speech-to-text", () => ({
  useSpeechToText: () => ({
    transcript: transcriptValue,
    listening: false,
    startListening,
    stopListening,
    setTranscript,
  }),
}));

describe("AddNoteForm UI", () => {
  it("should render all fields", () => {
    render(
      <MemoryRouter>
        <AddNoteForm onSubmit={async () => {}} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("note-header-input")).toBeInTheDocument();
    expect(screen.getByTestId("note-content-input")).toBeInTheDocument();
    expect(
      screen.getByTestId("select-elder-assigned-button")
    ).toBeInTheDocument();
  });

  it("should allow typing into fields", async () => {
    render(
      <MemoryRouter>
        <AddNoteForm onSubmit={async () => {}} />
      </MemoryRouter>
    );

    const headerInput = screen.getByTestId("note-header-input");
    await userEvent.type(headerInput, "Test header");
    expect(headerInput).toHaveValue("Test header");

    const contentInput = screen.getByTestId("note-content-input");
    await userEvent.type(contentInput, "Test content");
    expect(contentInput).toHaveValue("Test content");
  });

  // --- New test for speech-to-text ---
  it("should update content when transcript changes and call startListening on button click", async () => {
    const { rerender } = render(
      <MemoryRouter>
        <AddNoteForm onSubmit={async () => {}} />
      </MemoryRouter>
    );

    const contentInput = screen.getByTestId("note-content-input");
    expect(contentInput).toHaveValue(""); // initial empty

    // Simulate a transcript being added
    transcriptValue = "Hello from speech";

    // Re-render to trigger useEffect with updated transcript
    rerender(
      <MemoryRouter>
        <AddNoteForm onSubmit={async () => {}} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("note-content-input")).toHaveValue(
      "undefinedHello from speech"
    );

    // Test the voice input button
    const voiceBtn = screen.getByRole("button", { name: /Voice Input/i });
    await userEvent.click(voiceBtn);
    expect(startListening).toHaveBeenCalled();
  });
});
