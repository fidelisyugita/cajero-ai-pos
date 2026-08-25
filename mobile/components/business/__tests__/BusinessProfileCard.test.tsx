import { fireEvent, render, screen } from "@testing-library/react-native";
import type { Location } from "@/services/types/Store";
import BusinessProfileCard from "../BusinessProfileCard";

describe("BusinessProfileCard component", () => {
  const sampleLocation: Location = {
    street: "123 Coffee Way",
    city: "Jakarta",
    country: "Indonesia",
    postalCode: "12345",
  };

  const defaultProps = {
    name: "Cajero Cafe & Roastery",
    phone: "+6281234567890",
    website: "https://cajero.com",
    imageUrl: "https://cajero.com/logo.png",
    description: "Best specialty coffee shop in town",
    location: sampleLocation,
    loading: false,
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders profile information correctly when not loading", async () => {
    await render(<BusinessProfileCard {...defaultProps} />);

    expect(screen.getByText("Cajero Cafe & Roastery")).toBeTruthy();
    expect(screen.getByText("+6281234567890")).toBeTruthy();
    expect(screen.getByText("https://cajero.com")).toBeTruthy();
    expect(screen.getByText("Best specialty coffee shop in town")).toBeTruthy();
    expect(screen.getByText("123 Coffee Way/Jakarta/Indonesia/12345")).toBeTruthy();
  });

  it("calls onEdit when edit button is pressed", async () => {
    await render(<BusinessProfileCard {...defaultProps} />);

    const svgIcon = screen.getByTestId("svg-mock");
    fireEvent.press(svgIcon);

    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it("renders fallback location format when location is undefined", async () => {
    await render(
      <BusinessProfileCard {...defaultProps} location={undefined} imageUrl={undefined} />,
    );

    expect(screen.getByText("-/-/-/-")).toBeTruthy();
  });

  it("renders skeleton placeholders when loading is true", async () => {
    await render(<BusinessProfileCard {...defaultProps} loading={true} />);

    expect(screen.queryByText("Cajero Cafe & Roastery")).toBeNull();
    expect(screen.queryByText("+6281234567890")).toBeNull();
  });
});
