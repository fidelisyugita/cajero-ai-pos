import { render, screen } from "@testing-library/react-native";
import BusinessLocationCard from "../BusinessLocationCard";

describe("BusinessLocationCard component", () => {
  const defaultProps = {
    street: "Jl. Sudirman No. 45",
    city: "Jakarta Selatan",
    country: "Indonesia",
    postalCode: "12190",
    loading: false,
  };

  it("renders location fields correctly when not loading", async () => {
    await render(<BusinessLocationCard {...defaultProps} />);

    expect(screen.getByText("Location")).toBeTruthy();
    expect(screen.getByText("Street")).toBeTruthy();
    expect(screen.getByText("Jl. Sudirman No. 45")).toBeTruthy();
    expect(screen.getByText("City")).toBeTruthy();
    expect(screen.getByText("Jakarta Selatan")).toBeTruthy();
    expect(screen.getByText("Country")).toBeTruthy();
    expect(screen.getByText("Indonesia")).toBeTruthy();
    expect(screen.getByText("Postal Code")).toBeTruthy();
    expect(screen.getByText("12190")).toBeTruthy();
  });

  it("renders skeletons and hides info rows when loading is true", async () => {
    await render(<BusinessLocationCard {...defaultProps} loading={true} />);

    expect(screen.queryByText("Jl. Sudirman No. 45")).toBeNull();
    expect(screen.queryByText("Jakarta Selatan")).toBeNull();
  });
});
