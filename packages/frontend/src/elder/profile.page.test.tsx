import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ElderProfilePage from "./profile.page";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("@/nav/navbar", () => ({ default: () => <div /> }));

const httpGetMock = vi.fn();
vi.mock("@/lib/http", () => ({
  http: () => ({ get: httpGetMock }),
}));

vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,aaa"),
  },
}));

vi.mock("./use-elder-details", () => ({
  useElderDetails: () => ({
    elderDetails: {
      id: 12,
      name: "Ahmaaa",
      date_of_birth: new Date("1940-05-21"),
      gender: "female",
      phone: null,
      bio: "Loves gardening",
      profile_picture: null,
      created_at: new Date(),
      updated_at: new Date(),
      street_address: "Block 123",
      unit_number: null,
      postal_code: null,
      latitude: null,
      longitude: null,
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock("./use-elder-notes", () => ({
  useElderNotes: () => ({
    notes: [
      {
        id: 1,
        elder_id: 12,
        header: "Daily Meds",
        content: "At 9am",
        caregiver_name: "Jane",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/caregiver/use-caregivers-by-elder", () => ({
  useCaregiversByElderId: () => ({
    caregivers: [
      {
        id: "user-1",
        name: "Jane Caregiver",
        date_of_birth: new Date("1990-01-01"),
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={["/elder/12/profile"]}>
      <Routes>
        <Route path="/elder/:elderId/profile" element={<ElderProfilePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ElderProfilePage", () => {
  beforeEach(() => {
    httpGetMock.mockReset();
  });

  it("renders elder info and tabs", async () => {
    renderWithRoute();

    expect(await screen.findByText("Ahmaaa")).toBeInTheDocument();
    expect(screen.getAllByText(/years old/).length).toBeGreaterThan(0);
    expect(screen.getByText("My Caregivers")).toBeInTheDocument();
    expect(screen.getByText("My Calendar")).toBeInTheDocument();
    expect(screen.getByText("My Notes")).toBeInTheDocument();
  });

  it("opens invite modal and shows invite link and QR", async () => {
    httpGetMock.mockResolvedValueOnce({
      data: { inviteLink: "https://app.test/invite/abc", elderId: 12 },
    });

    renderWithRoute();
    await userEvent.click(screen.getByText("Invite"));

    await screen.findByText("Invite Caregivers");
    await screen.findByText("INVITE LINK");
    await screen.findByText("https://app.test/invite/abc");
  });

  it("switches to notes tab and shows note", async () => {
    renderWithRoute();
    await userEvent.click(screen.getByText("My Notes"));
    await screen.findByText("Daily Meds");
  });
});
