#!/usr/bin/env node
/**
 * Generates sample Excel (.xlsx) files for InsightPilot demo testing.
 * Run: npm run generate-sample
 */

const XLSX = require("xlsx");
const path = require("path");

// ── Sales data ─────────────────────────────────────────────────────────────────
const salesData = [
  ["Date", "Customer", "Product", "Rep", "Amount", "Region", "Status", "Units", "Notes"],
  ["01/05/2024", "Acme Corp", "Widget Pro", "Sarah J.", "$12400", "North", "Closed", 124, "Top customer Q1"],
  ["01/08/2024", "TechStart Inc", "Basic Plan", "Mike T.", "$3200", "East", "Closed", 32, ""],
  ["01/12/2024", "GlobalTech", "Widget Pro", "Sarah J.", "$8900", "North", "Closed", 89, "Rush order"],
  ["01/15/2024", "", "Premium Suite", "Bob K.", "$15600", "West", "Closed", 52, "Fortune 500 account"],
  ["01/18/2024", "Acme Corp", "Basic Plan", "Sarah J.", "$2800", "North", "Closed", 28, ""],
  ["01/22/2024", "RetailMax", "Widget Pro", "Mike T.", 9100, "East", "Closed", 91, "Repeat buyer"],
  ["01/25/2024", "TechStart Inc", "Premium Suite", "Bob K.", "$7800", "East", "Pending", 26, "Awaiting signature"],
  ["02/01/2024", "Acme Corp", "Widget Pro", "Sarah J.", "$11200", "North", "Closed", 112, ""],
  ["02/05/2024", "MegaCorp", "Basic Plan", "Tom R.", "$1200", "South", "Lost", 12, "Price sensitivity"],
  ["02/08/2024", "GlobalTech", "Premium Suite", "Sarah J.", "$19800", "North", "Closed", 66, ""],
  ["02/12/2024", "RetailMax", "Basic Plan", "Mike T.", "$2100", "East", "Closed", 21, ""],
  ["02/15/2024", "Acme Corp", "Widget Pro", "Sarah J.", "$13600", "North", "Closed", 136, "Strong repeat"],
  ["02/19/2024", "QuickBiz", "Basic Plan", "Tom R.", "$800", "South", "Lost", 8, "Chose competitor"],
  ["02/22/2024", "", "Widget Pro", "Bob K.", "$9400", "West", "Closed", 94, ""],
  ["02/26/2024", "TechStart Inc", "Widget Pro", "Mike T.", "$4100", "East", "Closed", 41, ""],
  ["03/01/2024", "Acme Corp", "Premium Suite", "Sarah J.", "$24000", "North", "Closed", 80, "New product upsell"],
  ["03/05/2024", "MegaCorp", "Widget Pro", "Tom R.", "$1800", "South", "Pending", 18, "Long approval cycle"],
  ["03/08/2024", "GlobalTech", "Basic Plan", "Sarah J.", "$3600", "North", "Closed", 36, ""],
  ["03/12/2024", "RetailMax", "Premium Suite", "Mike T.", "$11400", "East", "Closed", 38, ""],
  ["03/15/2024", "Acme Corp", "Widget Pro", "Sarah J.", "$14100", "North", "Closed", 141, "Best single order"],
  ["03/19/2024", "QuickBiz", "Widget Pro", "Tom R.", "$2200", "South", "Closed", 22, ""],
  ["03/22/2024", "TechStart Inc", "Premium Suite", "Bob K.", "$9600", "East", "Pending", 32, "Budget approval delay"],
  ["03/26/2024", "NewCo", "Basic Plan", "Tom R.", "$600", "South", "Lost", 6, "Free tier"],
  ["03/29/2024", "", "Widget Pro", "Sarah J.", "$7800", "North", "Closed", 78, ""],
  ["04/02/2024", "Acme Corp", "Premium Suite", "Sarah J.", "$27200", "North", "Closed", 88, "Largest deal YTD"],
  ["04/05/2024", "MegaCorp", "Basic Plan", "Tom R.", "$900", "South", "Lost", 9, "Third lost deal"],
  ["04/09/2024", "GlobalTech", "Widget Pro", "Bob K.", "$10300", "West", "Closed", 103, ""],
  ["04/12/2024", "RetailMax", "Basic Plan", "Mike T.", "$1800", "East", "Closed", 18, "Smaller than usual"],
  ["04/16/2024", "Acme Corp", "Widget Pro", "Sarah J.", "$12900", "North", "Closed", 129, ""],
  ["04/19/2024", "TechStart Inc", "Basic Plan", "Mike T.", "$2400", "East", "Closed", 24, ""],
  ["04/23/2024", "QuickBiz", "Premium Suite", "Tom R.", "$3800", "South", "Pending", 13, "Board approval needed"],
  ["04/26/2024", "", "Widget Pro", "Bob K.", "$8200", "West", "Closed", 82, ""],
  ["04/30/2024", "Acme Corp", "Premium Suite", "Sarah J.", "$28500", "North", "Closed", 95, "Record month"],
];

// ── Inventory data ─────────────────────────────────────────────────────────────
const inventoryData = [
  ["Month", "Product", "Category", "Units Sold", "Revenue", "Returns", "Inventory Level", "Supplier", "Lead Time (days)", "Notes"],
  ["Jan 2024", "Widget Pro X200", "Electronics", 245, 48755, 12, 380, "Shenzhen Mfg", 45, "Best seller"],
  ["Jan 2024", "Basic Handle Kit", "Hardware", 89, 5340, 3, 120, "LocalParts Co", 14, ""],
  ["Jan 2024", "Premium Case A1", "Accessories", 156, 23400, 8, 200, "Taiwan Tech", 30, ""],
  ["Feb 2024", "Widget Pro X200", "Electronics", 198, 39402, 18, 220, "Shenzhen Mfg", 45, "Returns spike"],
  ["Feb 2024", "Basic Handle Kit", "Hardware", 112, 6720, 1, 95, "LocalParts Co", 14, ""],
  ["Feb 2024", "Premium Case A1", "Accessories", 134, 20100, 5, 180, "Taiwan Tech", 30, ""],
  ["Mar 2024", "Widget Pro X200", "Electronics", 312, 62088, 8, 450, "Shenzhen Mfg", 45, "Strong recovery"],
  ["Mar 2024", "Basic Handle Kit", "Hardware", 78, 4680, 2, 85, "LocalParts Co", 14, "Low stock warning"],
  ["Mar 2024", "Premium Case A1", "Accessories", 178, 26700, 11, 210, "Taiwan Tech", 30, "Returns rising"],
  ["Apr 2024", "Widget Pro X200", "Electronics", 267, 53133, 9, 410, "Shenzhen Mfg", 45, ""],
  ["Apr 2024", "Basic Handle Kit", "Hardware", 134, 8040, 0, 40, "LocalParts Co", 14, "CRITICAL - reorder"],
  ["Apr 2024", "Premium Case A1", "Accessories", 201, 30150, 7, 160, "Taiwan Tech", 30, ""],
  ["May 2024", "Widget Pro X200", "Electronics", 289, 57522, 11, 350, "Shenzhen Mfg", 45, ""],
  ["May 2024", "Basic Handle Kit", "Hardware", 158, 9480, 1, 0, "LocalParts Co", 14, "STOCKOUT"],
  ["May 2024", "Premium Case A1", "Accessories", 189, 28350, 14, 120, "Taiwan Tech", 30, "Returns accelerating"],
  ["Jun 2024", "Widget Pro X200", "Electronics", 334, 66466, 7, 480, "Shenzhen Mfg", 45, "Quarterly record"],
  ["Jun 2024", "Basic Handle Kit", "Hardware", 201, 12060, 0, 145, "LocalParts Co", 14, "Backorders cleared"],
  ["Jun 2024", "Premium Case A1", "Accessories", 145, 21750, 22, 210, "Taiwan Tech", 30, "High return rate - investigate"],
];

function createWorkbook(sheetData, sheetName) {
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Auto-fit column widths
  const colWidths = sheetData[0].map((_, colIdx) => ({
    wch: Math.max(
      ...sheetData.map((row) => String(row[colIdx] ?? "").length),
      10
    ),
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return wb;
}

// Generate sales.xlsx
const salesWb = createWorkbook(salesData, "Sales Data");
const salesPath = path.join(__dirname, "../public/sample-sales.xlsx");
XLSX.writeFile(salesWb, salesPath);
console.log("✓ Generated:", salesPath);

// Generate inventory.xlsx
const inventoryWb = createWorkbook(inventoryData, "Inventory");
const inventoryPath = path.join(__dirname, "../public/sample-inventory.xlsx");
XLSX.writeFile(inventoryWb, inventoryPath);
console.log("✓ Generated:", inventoryPath);

console.log("\nSample XLSX files created. Upload them to InsightPilot to test.");
