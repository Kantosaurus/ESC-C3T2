import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AIPage from "./ai.page";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/nav/navbar", () => ({ default: () => <div /> }));

const postMock = vi.fn();
vi.mock("@/lib/http", () => ({
  http: () => ({ post: postMock }),
}));

describe("AIPage", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("sends a message and shows assistant text response", async () => {
    // First call returns regular response
    postMock.mockResolvedValueOnce({
      data: { response: "Hello! How can I help?" },
    });

    render(
      <MemoryRouter>
        <AIPage />
      </MemoryRouter>
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "Hi AI");
    (
      document.querySelector('button[type="submit"]') as HTMLButtonElement
    ).click();

    await screen.findByText("Hi AI");
    await screen.findByText("Hello! How can I help?");
  });

  it("handles tool call flow: requires_tool_calls -> tool_results -> final response", async () => {
    // 1) Initial model response asks for tool calls
    postMock.mockResolvedValueOnce({
      data: {
        requires_tool_calls: true,
        response: "I'll create a note for you.",
        tool_calls: [
          {
            id: "call_1",
            type: "function",
            function: {
              name: "create_note",
              arguments: JSON.stringify({
                header: "Meds",
                content: "Take pills",
                assigned_elder_id: 1,
              }),
            },
          },
        ],
      },
    });

    // 2) Tool execution results
    postMock.mockResolvedValueOnce({
      data: {
        tool_results: [
          {
            tool_call_id: "call_1",
            role: "tool",
            content: 'Successfully created note with ID 10: "Meds"',
          },
        ],
      },
    });

    // 3) Final response after tools
    postMock.mockResolvedValueOnce({
      data: { response: "Note created successfully." },
    });

    render(
      <MemoryRouter>
        <AIPage />
      </MemoryRouter>
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "Create a note for Ahmaaa: Meds");
    (
      document.querySelector('button[type="submit"]') as HTMLButtonElement
    ).click();

    // shows the intermediate assistant message indicating action
    await screen.findByText("I'll create a note for you.");
    // shows tool results content (may appear twice: as bubble text and as tool result pill)
    const toolTexts = await screen.findAllByText(
      /Successfully created note with ID 10/
    );
    expect(toolTexts.length).toBeGreaterThan(0);
    // shows final assistant text
    await screen.findByText("Note created successfully.");
  });
});
