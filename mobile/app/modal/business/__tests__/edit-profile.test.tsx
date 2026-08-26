import { fireEvent, render, screen } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useUpdateUserMutation } from "@/services/mutations/useUpdateUserMutation";
import { useUploadImageMutation } from "@/services/mutations/useUploadImageMutation";
import EditProfileModal from "../edit-profile";

jest.mock("@/services/mutations/useUpdateUserMutation", () => ({
  useUpdateUserMutation: jest.fn(),
}));

jest.mock("@/services/mutations/useUploadImageMutation", () => ({
  useUploadImageMutation: jest.fn(),
}));

describe("EditProfileModal integration", () => {
  const sampleUser = {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+62812345678",
    roleCode: "OWNER",
    imageUrl: "https://example.com/john.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      userData: JSON.stringify(sampleUser),
    });
    (useUpdateUserMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
    (useUploadImageMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it("pre-fills form with user data and renders modal fields", async () => {
    await render(<EditProfileModal />);

    expect(screen.getByText("Edit Profile")).toBeTruthy();
    expect(screen.getByDisplayValue("John Doe")).toBeTruthy();
    expect(screen.getByDisplayValue("john@example.com")).toBeTruthy();
    expect(screen.getByDisplayValue("+62812345678")).toBeTruthy();
    expect(screen.getByDisplayValue("OWNER")).toBeTruthy();
    expect(screen.getByText("Update Profile")).toBeTruthy();
  });

  it("navigates back on Cancel button press", async () => {
    await render(<EditProfileModal />);

    const cancelBtn = screen.getByText("Cancel");
    fireEvent.press(cancelBtn);

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
