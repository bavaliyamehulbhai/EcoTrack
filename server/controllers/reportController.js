import CarbonRecord from "../models/CarbonRecord.js";
import Goal from "../models/Goal.js";
import UserAction from "../models/UserAction.js";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";

// GET /api/reports/summary
export const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const records = await CarbonRecord.find({ userId });
    const totalCarbon = records.reduce((sum, r) => sum + (r.totalCarbon || 0), 0);
    const avgCarbon = records.length > 0 ? totalCarbon / records.length : 0;

    const totalGoals = await Goal.countDocuments({ userId });
    const completedActions = await UserAction.countDocuments({ userId });

    const user = await User.findById(userId).select("points");

  res.json({
    totalCarbon: Math.round(totalCarbon * 10) / 10,
    avgCarbon: Math.round(avgCarbon * 10) / 10,
    totalGoals,
    completedActions,
    points: user ? user.points : 0
  });
});

// GET /api/reports/csv
export const exportCSV = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const records = await CarbonRecord.find({ userId }).sort({ createdAt: -1 });

    const csvHeaders = "Date,Transport (kg),Electricity (kg),Food (kg),Waste (kg),Water (kg),Total Carbon (kg)\n";
    const csvRows = records
      .map((r) => {
        const dateStr = new Date(r.createdAt).toLocaleDateString().replace(/,/g, "");
        return `${dateStr},${r.transport},${r.electricity},${r.food},${r.waste},${r.water},${r.totalCarbon}`;
      })
      .join("\n");

    const csvContent = csvHeaders + csvRows;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=carbon-history.csv");
  res.status(200).send(csvContent);
});

// GET /api/reports/pdf (HTML-to-PDF Print Page)
export const generatePDFReport = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }

    const records = await CarbonRecord.find({ userId }).sort({ createdAt: -1 }).limit(10);
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 }).limit(5);

    const totalCarbon = records.reduce((sum, r) => sum + (r.totalCarbon || 0), 0);
    const avgCarbon = records.length > 0 ? totalCarbon / records.length : 0;
    const completedGoalsCount = goals.filter((g) => g.status === "Completed").length;

    // Build print-optimized beautiful HTML document
    const htmlReport = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EcoTrack Sustainability Report</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            line-height: 1.5;
            padding: 40px;
            background: #fff;
            margin: 0;
          }
          .header {
            border-bottom: 2px solid #22c55e;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .title {
            font-size: 26px;
            font-weight: 700;
            color: #111827;
            margin: 0;
          }
          .meta {
            text-align: right;
            font-size: 13px;
            color: #6b7280;
          }
          .subtitle {
            font-size: 14px;
            color: #22c55e;
            font-weight: 600;
            margin-top: 4px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 40px;
          }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            background: #f9fafb;
          }
          .card-title {
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 5px;
            font-weight: 600;
          }
          .card-value {
            font-size: 20px;
            font-weight: 700;
            color: #22c55e;
          }
          .section-title {
            font-size: 18px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
            color: #1f2937;
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 35px;
            font-size: 13.5px;
          }
          th {
            background: #f3f4f6;
            color: #374151;
            font-weight: 600;
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            color: #4b5563;
          }
          .badge {
            background: #e0f2fe;
            color: #0369a1;
            padding: 2px 8px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
          }
          .badge.success {
            background: #dcfce7;
            color: #15803d;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13.5px; color: #166534; font-weight: 500;">
            📄 Your print-optimized document is ready. Save it as a PDF via the browser print dialog.
          </span>
          <button onclick="window.print()" style="padding: 6px 16px; background: #22c55e; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">
            Print / Save PDF
          </button>
        </div>

        <div class="header">
          <div>
            <h1 class="title">EcoTrack Sustainability Report</h1>
            <div class="subtitle">Personal Carbon Footprint & Performance Audit</div>
          </div>
          <div class="meta">
            <div>User: <strong>${user.name}</strong></div>
            <div>Email: ${user.email}</div>
            <div>Date Generated: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="card">
            <div class="card-title">Cumulative Carbon</div>
            <div class="card-value">${totalCarbon.toFixed(1)} kg</div>
          </div>
          <div class="card">
            <div class="card-title">Average Assessment</div>
            <div class="card-value">${avgCarbon.toFixed(1)} kg</div>
          </div>
          <div class="card">
            <div class="card-title">Goals Set</div>
            <div class="card-value">${goals.length} (${completedGoalsCount} met)</div>
          </div>
          <div class="card">
            <div class="card-title font-points">Eco Reward Points</div>
            <div class="card-value" style="color: #f59e0b;">⭐ ${user.points || 0}</div>
          </div>
        </div>

        <h2 class="section-title">🌱 Recent Carbon Footprint Records</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Transport</th>
              <th>Electricity</th>
              <th>Food</th>
              <th>Waste</th>
              <th>Water</th>
              <th>Total Carbon</th>
            </tr>
          </thead>
          <tbody>
            ${records.map((r) => `
              <tr>
                <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                <td>${r.transport?.toFixed(1)} kg</td>
                <td>${r.electricity?.toFixed(1)} kg</td>
                <td>${r.food?.toFixed(1)} kg</td>
                <td>${r.waste?.toFixed(1)} kg</td>
                <td>${r.water?.toFixed(1)} kg</td>
                <td style="font-weight: 600; color: #16a34a;">${r.totalCarbon?.toFixed(1)} kg</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <h2 class="section-title">🎯 Performance Reduction Goals</h2>
        <table>
          <thead>
            <tr>
              <th>Goal Description</th>
              <th>Target Limit</th>
              <th>Deadline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${goals.length === 0 ? `<tr><td colspan="4" style="text-align: center; color: #9ca3af;">No goals registered.</td></tr>` : 
              goals.map((g) => `
                <tr>
                  <td style="font-weight: 500; color: #111827;">${g.title}</td>
                  <td>${g.targetCarbon} kg CO₂</td>
                  <td>${new Date(g.deadline).toLocaleDateString()}</td>
                  <td>
                    <span class="badge ${g.status === "Completed" ? "success" : ""}">
                      ${g.status}
                    </span>
                  </td>
                </tr>
              `).join("")
            }
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for logging your daily carbon prints. Every step counts to reduce global warming.</p>
          <p>© ${new Date().getFullYear()} EcoTrack Platform. All rights reserved.</p>
        </div>

        <script>
          // Auto-trigger browser print dialog on page load
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(htmlReport);
});
