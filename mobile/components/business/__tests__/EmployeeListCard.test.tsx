import { fireEvent, render, screen } from "@testing-library/react-native";
import type { Employee } from "../EmployeeItem";
import EmployeeListCard from "../EmployeeListCard";

describe("EmployeeListCard component", () => {
  const sampleEmployees: Employee[] = [
    {
      id: "e-1",
      name: "John Barista",
      role: "Barista",
      email: "john@cajero.com",
      status: "Active",
    },
    {
      id: "e-2",
      name: "Sarah Cashier",
      role: "Cashier",
      email: "sarah@cajero.com",
      status: "Inactive",
    },
  ];

  it("renders list of employees and add employee button when count < 5", async () => {
    const mockAdd = jest.fn();
    await render(
      <EmployeeListCard employees={sampleEmployees} onAddEmployee={mockAdd} loading={false} />,
    );

    expect(screen.getByText("John Barista")).toBeTruthy();
    expect(screen.getByText("Sarah Cashier")).toBeTruthy();

    const addBtn = screen.getByText("Add Employee");
    fireEvent.press(addBtn);
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });

  it("renders empty state when no employees exist", async () => {
    await render(<EmployeeListCard employees={[]} onAddEmployee={jest.fn()} loading={false} />);

    expect(screen.getByText("No Employees Found")).toBeTruthy();
  });

  it("renders skeleton when loading is true", async () => {
    await render(
      <EmployeeListCard employees={sampleEmployees} onAddEmployee={jest.fn()} loading={true} />,
    );

    expect(screen.queryByText("John Barista")).toBeNull();
  });
});
