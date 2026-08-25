import {
  getPaymentMethods,
  getTransactionStatuses,
  getTransactionTypes,
} from "@/services/endpoints/references";
import { useReferenceStore } from "../useReferenceStore";

jest.mock("@/services/endpoints/references", () => ({
  getPaymentMethods: jest.fn(),
  getTransactionStatuses: jest.fn(),
  getTransactionTypes: jest.fn(),
}));

describe("useReferenceStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useReferenceStore.setState({
      transactionTypes: [],
      paymentMethods: [],
      transactionStatuses: [],
    });
  });

  it("should initialize with empty reference lists", () => {
    const state = useReferenceStore.getState();
    expect(state.transactionTypes).toEqual([]);
    expect(state.paymentMethods).toEqual([]);
    expect(state.transactionStatuses).toEqual([]);
  });

  it("should fetch all references and update state", async () => {
    const mockTypes = [{ id: "1", code: "SALE", name: "Sale" }];
    const mockMethods = [{ id: "1", code: "CASH", name: "Cash" }];
    const mockStatuses = [{ id: "1", code: "COMPLETED", name: "Completed" }];

    (getTransactionTypes as jest.Mock).mockResolvedValue(mockTypes);
    (getPaymentMethods as jest.Mock).mockResolvedValue(mockMethods);
    (getTransactionStatuses as jest.Mock).mockResolvedValue(mockStatuses);

    await useReferenceStore.getState().fetchAll();

    const state = useReferenceStore.getState();
    expect(state.transactionTypes).toEqual(mockTypes);
    expect(state.paymentMethods).toEqual(mockMethods);
    expect(state.transactionStatuses).toEqual(mockStatuses);

    expect(getTransactionTypes).toHaveBeenCalledTimes(1);
    expect(getPaymentMethods).toHaveBeenCalledTimes(1);
    expect(getTransactionStatuses).toHaveBeenCalledTimes(1);
  });
});
