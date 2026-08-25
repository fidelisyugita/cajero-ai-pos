import { fireEvent, render, screen } from "@testing-library/react-native";
import EmployeeItem, { type Employee } from "../EmployeeItem";

describe("EmployeeItem component", () => {
  const sampleActiveEmployee: Employee = {
    id: "emp-1",
    name: "Alex Barista",
    role: "Barista",
    email: "alex@cajero.com",
    status: "Active",
    avatar: "https://cajero.com/alex.jpg",
  };

  const sampleInactiveEmployee: Employee = {
    id: "emp-2",
    name: "Sam Cashier",
    role: "Cashier",
    email: "sam@cajero.com",
    status: "Inactive",
  };

  it("renders active employee details, role, email, and active badge", async () => {
    const mockOnPressDetails = jest.fn();
    await render(
      <EmployeeItem employee={sampleActiveEmployee} onPressDetails={mockOnPressDetails} />,
    );

    expect(screen.getByText("Alex Barista")).toBeTruthy();
    expect(screen.getByText("Barista")).toBeTruthy();
    expect(screen.getByText("alex@cajero.com")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();

    const detailsBtn = screen.getByText("Details");
    fireEvent.press(detailsBtn);
    expect(mockOnPressDetails).toHaveBeenCalledTimes(1);
  });

  it("renders inactive employee details and inactive badge", async () => {
    const mockOnPressDetails = jest.fn();
    await render(
      <EmployeeItem employee={sampleInactiveEmployee} onPressDetails={mockOnPressDetails} />,
    );

    expect(screen.getByText("Sam Cashier")).toBeTruthy();
    expect(screen.getByText("Inactive")).toBeTruthy();
  });
});
