import { type Business, useBusinessStore } from "../useBusinessStore";

describe("useBusinessStore", () => {
  beforeEach(() => {
    useBusinessStore.setState({ business: null });
  });

  it("should initialize with default null state", () => {
    expect(useBusinessStore.getState().business).toBeNull();
  });

  it("should set business details", () => {
    const mockBusiness: Business = {
      id: "biz-1",
      name: "Cajero Coffee",
      description: "Artisanal Coffee & Bakery",
      address: "Jl. Sudirman No. 10, Jakarta",
      phone: "+628111222333",
      email: "contact@cajerocoffee.com",
      website: "https://cajerocoffee.com",
      logoUrl: "https://cajerocoffee.com/logo.png",
      subscriptionStatus: "pro",
      subscriptionPlanId: "plan-pro-yearly",
      subscriptionExpiresAt: "2027-01-01T00:00:00Z",
      maxDiscount: 50,
    };

    useBusinessStore.getState().setBusiness(mockBusiness);
    expect(useBusinessStore.getState().business).toEqual(mockBusiness);
  });

  it("should clear business on null set", () => {
    const mockBusiness: Business = {
      id: "biz-1",
      name: "Cajero Coffee",
    };

    useBusinessStore.getState().setBusiness(mockBusiness);
    expect(useBusinessStore.getState().business).not.toBeNull();

    useBusinessStore.getState().setBusiness(null);
    expect(useBusinessStore.getState().business).toBeNull();
  });
});
