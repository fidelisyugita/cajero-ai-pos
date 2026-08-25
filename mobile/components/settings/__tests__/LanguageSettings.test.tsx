import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useLanguageStore } from "@/store/useLanguageStore";
import LanguageSettings from "../LanguageSettings";

describe("LanguageSettings component", () => {
  beforeEach(() => {
    useLanguageStore.setState({
      language: "en",
      setLanguage: (lang) => useLanguageStore.setState({ language: lang }),
    });
  });

  it("renders language options (English, Indonesian)", async () => {
    await render(<LanguageSettings />);

    expect(screen.getByText("English")).toBeTruthy();
    expect(screen.getByText("Indonesian")).toBeTruthy();
  });

  it("switches language selection and saves changes to store", async () => {
    await render(<LanguageSettings />);

    const indoOption = screen.getByText("Indonesian");
    await act(async () => {
      fireEvent.press(indoOption);
    });

    const saveBtn = screen.getByText("Save Changes");
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(useLanguageStore.getState().language).toBe("id");
  });
});
