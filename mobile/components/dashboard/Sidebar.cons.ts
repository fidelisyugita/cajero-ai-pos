import IcReport0 from "@/assets/icons/calculator-0.svg";
import IcReport1 from "@/assets/icons/calculator-1.svg";
import IcAttendance0 from "@/assets/icons/calendar-0.svg";
import IcAttendance1 from "@/assets/icons/calendar-1.svg";
import IcExpenses0 from "@/assets/icons/expenses-0.svg";
import IcExpenses1 from "@/assets/icons/expenses-1.svg";
import IcSettings0 from "@/assets/icons/gear-0.svg";
import IcSettings1 from "@/assets/icons/gear-1.svg";
import IcMenu0 from "@/assets/icons/menu-0.svg";
import IcMenu1 from "@/assets/icons/menu-1.svg";
import IcReceipts0 from "@/assets/icons/receipt-0.svg";
import IcReceipts1 from "@/assets/icons/receipt-1.svg";
import IcStock0 from "@/assets/icons/stock-0.svg";
import IcStock1 from "@/assets/icons/stock-1.svg";
import IcBusiness0 from "@/assets/icons/store-0.svg";
import IcBusiness1 from "@/assets/icons/store-1.svg";

export const LIST_SIDEBAR_ITEMS = [
	{
		Icon: [IcMenu0, IcMenu1],
		label: "Menu",
		path: "/(dashboard)/menu",
	},
	{
		Icon: [IcReceipts0, IcReceipts1],
		label: "Receipts",
		path: "/(dashboard)/receipt",
	},
	{
		Icon: [IcStock0, IcStock1],
		label: "Stock",
		path: "/(dashboard)/stock",
	},
	{
		Icon: [IcExpenses0, IcExpenses1],
		label: "Expenses",
		path: "/(dashboard)/expense",
	},
	{
		Icon: [IcReport0, IcReport1],
		label: "Report",
		path: "/(dashboard)/report",
	},
	{
		Icon: [IcBusiness0, IcBusiness1],
		label: "Business",
		path: "/(dashboard)/business",
	},
	// Attendance is not implemented yet
	// {
	// 	Icon: [IcAttendance0, IcAttendance1],
	// 	label: "Attendance",
	// 	path: "/(dashboard)/attendance",
	// },
	{
		Icon: [IcAttendance0, IcAttendance1],
		label: "Assistant",
		path: "/(dashboard)/ai-chat",
	},
	{
		Icon: [IcSettings0, IcSettings1],
		label: "Settings",
		path: "/(dashboard)/settings",
	},
];
