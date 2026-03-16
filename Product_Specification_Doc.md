# Product Specification Document: IT Help Desk Ticketing System

## 1. Project Overview
The "IT Help Desk Ticketing System" is a web-based application designed to manage, track, and resolve IT support requests. The core of the system is a Kanban Board that allows IT agents to visualize and update the lifecycle of each ticket from creation to resolution.

### Team Members
- Juan Felipe Chilito Hoyos
- Ethan Alejandro Mezu
- Nicolle Mera Gomez

## 2. Core Functional Requirements

### 2.1 Ticket Management
- Users must be able to create support tickets.
- Required ticket fields:
  - **Subject**: A brief title of the issue.
  - **Description**: Detailed explanation of the problem.
  - **Category**: Classification of the issue (e.g., Hardware, Software, Network).
  - **Priority**: Urgency level (e.g., Low, Medium, High, Critical).
- Agents/Users must be able to view detailed information for each individual ticket.

### 2.2 File Attachments
- Users can attach files (screenshots, documents) to their tickets during creation to provide better context.

### 2.3 Kanban Board (Ticket Flow)
- Tickets follow a state lifecycle: **Nuevo (New)** -> **En Progreso (In Progress)** -> **Resuelto (Resolved)**.
- **Visual Interface**: Tickets should be displayed in columns corresponding to their state.
- **Drag-and-Drop**: Users can move tickets between columns by dragging and dropping them.
- **Accessibility**: There must be an alternative accessible UI (e.g., a "Move to..." dropdown/button) to alter the ticket state without drag-and-drop.

### 2.4 Analytics & Tracking (Dashboard)
- A metrics dashboard must be available showing:
  - Total ticket counts broken down by status.
  - Distribution of tickets by category and priority.

### 2.5 Communication & Logs
- **Comments**: Internal threaded comments for each ticket to facilitate communication.
- **History Log**: A chronological audit log tracking changes (e.g., status updates) applied to a ticket.
- **Localization**: ALL communications, placeholders, buttons, and dummy data MUST be localized in **Spanish**.

### 2.6 Search, Filter, and Export
- **Global Search**: Text search spanning ticket subjects and descriptions.
- **Filters**: Capability to filter the board by Priority, Status, and Category.
- **Export**: Feature to export the current board view (tickets) to a CSV file.

## 3. Non-Functional Requirements & Technology Stack

### 3.1 Architecture & Stack
- **Frontend Framework**: Next.js 14 (App Router).
- **Styling**: Tailwind CSS.
- **UI Components**: `shadcn/ui` for accessible, reusable components (cards, dialogs, selects).
- **Database**: PostgreSQL hosted via **Supabase**.
- **Auth & Storage**: **Firebase** for user authentication (Email/Google) and cloud file storage.

### 3.2 UI/UX Aesthetics
- **Color Palette**: 
  - **Primary**: Navy Blue (Headers/Navigation).
  - **Background**: White (Cleanliness).
  - **Accents**: Yellow (Warnings/Highlights/Active states).
- **Responsiveness**: The entire application, especially the Kanban board, must look and function perfectly on mobile screens as well as desktops.
- **Performance**: High priority on efficient list rendering, agile filtering, and clean React state management.

### 3.3 Security
- **Row Level Security (RLS)**: Must be configured in Supabase to ensure users only see and modify data they are authorized to access. 

## 4. Database Schema Structure
- **Table: `tickets`**
  - `id`, `subject`, `description`, `category`, `priority`, `status`, `created_at`, `user_id`, `attachment_url`
- **Table: `comments`**
  - `id`, `ticket_id`, `content`, `created_at`, `user_id`
- **Table: `ticket_history`**
  - `id`, `ticket_id`, `field_changed`, `old_value`, `new_value`, `changed_at`

## 5. Testing & Deployment Strategy
- **Testing**: Automated tests (E2E/Integration) will be generated and executed using TestSprite at the end of development to ensure core flows operate as intended.
- **Deployment**: The application will be Dockerized and deployed via Google Cloud Run upon successful QA.
