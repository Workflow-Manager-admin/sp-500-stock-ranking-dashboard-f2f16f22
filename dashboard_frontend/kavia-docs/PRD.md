# Product Requirements Document (PRD)
### S&P 500 Stock Ranking Dashboard - `dashboard_frontend` (React)

---

## 1. Purpose

The goal of the S&P 500 Stock Ranking Dashboard frontend is to provide users with a modern, minimalistic, and responsive web application to view and interact with real-time performance data for S&P 500 companies. The dashboard offers stock ranking, performance disposition (Buy, Sell, Hold), and detailed metrics for each company, built using React with a light, clean user interface. The initial implementation focuses on the AAPL ticker as a demonstration of core functionality.

---

## 2. Scope

- **Container/Component Name:** dashboard_frontend
- **Platform:** Web
- **Framework:** React (no heavy UI frameworks; vanilla CSS)
- **API Integration:** Real-time data fetched via REST API calls to Finnhub.
- **User Interface:** Web UI
- **Deployment:** Responsive, ready for mobile and desktop use

---

## 3. Product Overview

The application presents S&P 500 stock rankings driven by 10 key performance metrics. Each stock is tagged with a "Buy", "Sell", or "Hold" disposition calculated from live Finnhub data. Users may search for companies (with initial implementation restricted to "AAPL"), sort and filter stocks, and access detailed metric views. The application demonstrates best-in-class user experience, clarity, and speed by minimizing dependencies and using a clean design system.

---

## 4. Features

### Must-Have
1. **Dashboard View for S&P 500 Ranking:** Main dashboard displays a tabular view of all S&P 500 stocks ranked by performance.
2. **Company Search:** User can search for companies; initially limited to "AAPL" (Apple Inc.).
3. **Stock Performance Parameters:** Display 10 key performance metrics per stock.
4. **Disposition Indicator:** Each stock is labeled as Buy/Sell/Hold based on performance data.
5. **Real-Time Finnhub Data Queries:** Data is fetched live from Finnhub on load and refresh.
6. **Sortable & Filterable Table:** The stock table allows sorting and filtering based on columns/parameters.
7. **Responsive Layout:** Application adapts to both mobile and desktop screens.
8. **Loading/Error States:** Visual cues for loading and proper error feedback for failed data fetches.

### Nice-to-Have
9. **User Login/Authentication:** Login/authentication flow, optional and disabled by default in demo mode.
10. **Sidebar Navigation:** Toggleable left-hand sidebar navigation (optional).
11. **Details Modal/Drawer:** Clicking a company row opens a modal/drawer with expanded details about the selected stock.
12. **Light Theme:** All screens use a light color palette consistent with modern minimalism.
13. **Footer with Credits:** Static footer with links to credits and relevant project info.

---

## 5. Layout & Structure

### High-Level UI Architecture

- **Header:** Contains brand/project title, primary user controls (theme toggle, search input, login button if enabled).
- **Sidebar (optional):** Navigation for additional features or filter options.
- **Main Content Area:** Centralized sortable/filterable table of S&P 500 stocks. Each row represents a stock with columns for name, ticker, disposition, and all 10 parameters.
- **Modal/Drawer:** For expanded stock/company details triggered when a row is selected or clicked.
- **Footer:** Fixed at the bottom; includes credits and project links.

#### Layout Overview (Mermaid)

```mermaid
flowchart TB
    A[Header: Title & Controls]
    B[Sidebar Navigation (optional)]
    C[Main Content: Stock Table]
    D[Details Modal/Drawer]
    E[Footer: Credits]
    A --> C
    B --> C
    C --> D
    C --> E
```

---

## 6. Visual & Interaction Design

- **Style:** Modern and minimalistic; focus on whitespace and clarity, with limited accent colors.
- **Theme:** Light mode as default; all colors and UI affordances defined in vanilla CSS (`App.css`).
- **Responsiveness:** Uses CSS flex/grid for adaptive layout on phone, tablet, and desktop.
- **Branding:** No heavy branding, but support for neutral accent colors (primary: #1a73e8, secondary: #fbbc05, accent: #34a853) as needed.
- **Components:** Reusable buttons, tables, dialogs, and input fields; built with accessible HTML and styled via CSS variables.

---

## 7. Functional Requirements

- **REST API Integration:**
  - All stock, metric, and disposition data is fetched in real-time from the Finnhub API (sample endpoints, keys managed securely).
- **State Management:**
  - Use of React state/hooks for UI and network logic (Redux or Context API is out-of-scope unless complexity demands).
- **Loading/Error Handling:**
  - Clear UI states for in-progress requests or errors (alerts, inline warnings or toasts).
- **Accessibility:**
  - Basic accessibility compliance (WCAG), including ARIA labels on controls and good keyboard navigation.

---

## 8. Non-Functional Requirements

- **Performance:** Fast load, minimal bundle, and responsive <100ms UI feedback.
- **Compatibility:** Latest versions of Chrome, Firefox, Safari, and Edge; mobile browsers.
- **Security:** Secure handling of any authentication token and API key.
- **Scalability:** Application code should be structured for future expansion (more tickers, additional metrics, authentication).

---

## 9. Out of Scope

- Advanced analytic visualizations (bar/pie charts, etc.) for initial version.
- User profile management, persistent settings.
- Back-end for API proxying, batching, or caching.
- Any UI frameworks outside of React and vanilla CSS.

---

## 10. Acceptance Criteria

- User can view S&P 500 stocks as a sortable/filterable table.
- User can search for "AAPL" and see real-time performance and disposition.
- Dashboard adapts cleanly to different screen sizes.
- Errors in Finnhub API fetches are handled gracefully.
- All interface text and visuals use modern, minimal, light theme.
- Initial user authentication is optional and not enabled by default.

---

## 11. Dependencies and External Services

- **Finnhub API** for live stock data.
- Open-source React and CSS; no dependency on UI frameworks.
- No direct third-party services except Finnhub.

---

## 12. Future Scope (for v2+)

- Enable full company search (all S&P 500 tickers).
- Advanced filtering and analytics/charts.
- Persistent user authentication and preferences.

---

_Last updated: 2024-06-09_

