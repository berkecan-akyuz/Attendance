import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EnrollmentForm } from '../ui/src/components/EnrollmentForm';
import React from 'react';

// Mock ResizeObserver
class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}
global.ResizeObserver = ResizeObserver;

describe('EnrollmentForm', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        classData: { id: "1", name: "CS101" },
        activeTab: "students" as const,
        onTabChange: vi.fn(),
        loading: false,
        error: null,
        attendanceSummary: null,
        attendanceSessions: [],
        enrolledStudents: [],
        onRemoveStudent: vi.fn(),
        availableStudents: [
            { user_id: 1, full_name: "John Doe", email: "john@example.com", roll_number: "A001" },
            { user_id: 2, full_name: "Jane Smith", email: "jane@example.com", roll_number: "A002" },
        ],
        searchQuery: "",
        onSearchChange: vi.fn(),
        selectedStudentIds: [],
        onSelectionChange: vi.fn(),
        onAddStudents: vi.fn(),
    };

    it('renders nothing when not open', () => {
        const { container } = render(<EnrollmentForm {...defaultProps} isOpen={false} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders student list correctly', () => {
        render(<EnrollmentForm {...defaultProps} />);
        expect(screen.getByText("CS101")).toBeInTheDocument();
        expect(screen.getByText("Add Student to Class")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it('handles student selection', () => {
        const onSelectionChange = vi.fn();
        render(<EnrollmentForm {...defaultProps} onSelectionChange={onSelectionChange} />);

        // Find checkbox for John Doe.
        // Note: Radix UI Checkbox or Lucide might be used. 
        // The component uses standard Checkbox from shadcn (Radix).
        // It's inside a label. Clicking the label should toggle it.

        const label = screen.getByText("John Doe");
        fireEvent.click(label);

        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        // The ID "1" should be in the call since it wasn't selected before.
        expect(onSelectionChange).toHaveBeenCalledWith(["1"]);
    });

    it('calls onAddStudents when button clicked', () => {
        const onAddStudents = vi.fn();
        // Must select students first for button to be enabled
        render(<EnrollmentForm {...defaultProps} selectedStudentIds={["1"]} onAddStudents={onAddStudents} />);

        const addButton = screen.getByText(/Add Selected Students/i);
        expect(addButton).not.toBeDisabled();
        fireEvent.click(addButton);

        expect(onAddStudents).toHaveBeenCalled();
    });

    it('displays navigation tabs', () => {
        render(<EnrollmentForm {...defaultProps} />);
        expect(screen.getByText("Students")).toBeInTheDocument();
        expect(screen.getByText("Attendance")).toBeInTheDocument();
    });
});
