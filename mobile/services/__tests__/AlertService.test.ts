import { Alert } from "react-native";
import alertService, { AlertService } from "../AlertService";

describe("AlertService", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("should display alert using show with custom buttons and options", () => {
    const customButtons = [{ text: "Yes" }, { text: "No" }];
    const customOptions = { cancelable: true };

    alertService.show("Title", "Message", customButtons, customOptions);

    expect(alertSpy).toHaveBeenCalledWith("Title", "Message", customButtons, customOptions);
  });

  it("should display info alert with OK button", () => {
    alertService.info("Info Title", "Info Message", { cancelable: false });

    expect(alertSpy).toHaveBeenCalledWith("Info Title", "Info Message", [{ text: "OK" }], {
      cancelable: false,
    });
  });

  it("should display success alert with OK button", () => {
    alertService.success("Success Title", "Success Message");

    expect(alertSpy).toHaveBeenCalledWith(
      "Success Title",
      "Success Message",
      [{ text: "OK" }],
      undefined,
    );
  });

  it("should display warning alert with OK button", () => {
    alertService.warning("Warning Title", "Warning Message");

    expect(alertSpy).toHaveBeenCalledWith(
      "Warning Title",
      "Warning Message",
      [{ text: "OK" }],
      undefined,
    );
  });

  it("should display error alert with destructive OK button", () => {
    alertService.error("Error Title", "Error Message");

    expect(alertSpy).toHaveBeenCalledWith(
      "Error Title",
      "Error Message",
      [{ text: "OK", style: "destructive" }],
      undefined,
    );
  });

  describe("confirm", () => {
    it("should resolve true when confirm button is pressed", async () => {
      alertSpy.mockImplementation((_title, _message, buttons) => {
        const confirmButton = buttons?.[1];
        confirmButton?.onPress?.();
      });

      const result = await alertService.confirm("Delete?", "Are you sure?");
      expect(result).toBe(true);
      expect(alertSpy).toHaveBeenCalledWith(
        "Delete?",
        "Are you sure?",
        [
          { text: "Cancel", style: "cancel", onPress: expect.any(Function) },
          { text: "OK", onPress: expect.any(Function) },
        ],
        { cancelable: undefined, onDismiss: undefined },
      );
    });

    it("should resolve false when cancel button is pressed", async () => {
      alertSpy.mockImplementation((_title, _message, buttons) => {
        const cancelButton = buttons?.[0];
        cancelButton?.onPress?.();
      });

      const result = await alertService.confirm("Delete?", "Are you sure?", {
        confirmText: "Yes, delete",
        cancelText: "No, keep",
        cancelable: true,
      });
      expect(result).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(
        "Delete?",
        "Are you sure?",
        [
          { text: "No, keep", style: "cancel", onPress: expect.any(Function) },
          { text: "Yes, delete", onPress: expect.any(Function) },
        ],
        { cancelable: true, onDismiss: undefined },
      );
    });
  });

  it("should support instantiating new AlertService class", () => {
    const customService = new AlertService();
    customService.info("Custom Instance");
    expect(alertSpy).toHaveBeenCalledWith(
      "Custom Instance",
      undefined,
      [{ text: "OK" }],
      undefined,
    );
  });
});
