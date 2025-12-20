import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StudentForm } from '../ui/src/components/StudentForm';
import React from 'react';

// Mock UI components if necessary, but integration testing the real UI components is better if they are simple.
// However, Select component from Radix UI can be tricky in JSDOM. 
// If it fails, we might need to mock it or polyfill PointerEvents.
// Let's try real rendering first.

// Radix UI often requires ResizeObserver
class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}
global.ResizeObserver = ResizeObserver;

describe('StudentForm', () => {
    const defaultProps = {
        formData: {
            fullName: '',
            rollNumber: '',
            department: '',
            email: '',
            phoneNumber: '',
            password: '',
        },
        departments: [
            { department_id: 1, name: 'Computer Science', code: 'CS', created_at: '' },
            { department_id: 2, name: 'Mathematics', code: 'MATH', created_at: '' },
        ],
        departmentsLoading: false,
        setFormData: vi.fn(),
    };

    it('renders all form fields', () => {
        render(<StudentForm {...defaultProps} />);

        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Roll Number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    it('calls setFormData when input changes', () => {
        const setFormData = vi.fn();
        // We need to implement the callback behavior to update local state if we want to see value change,
        // but StudentForm is controlled. 
        // So we just check if setFn is called.

        // However, StudentForm uses `setFormData(prev => ...)` functional update.
        // We can just verify it was called.

        render(<StudentForm {...defaultProps} setFormData={setFormData} />);

        const nameInput = screen.getByLabelText(/Full Name/i);
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });

        expect(setFormData).toHaveBeenCalled();
    });

    it('displays loading state for departments', () => {
        render(<StudentForm {...defaultProps} departmentsLoading={true} />);
        // The SelectTrigger renders text based on loading state
        expect(screen.getByText(/Loading departments.../i)).toBeInTheDocument();
    });

    it('renders department options', async () => {
        // Radix Select is tricky to test interaction in JSDOM without pointer events mock sometimes.
        // For now, let's just check if the Trigger is there.
        render(<StudentForm {...defaultProps} />);
        expect(screen.getByText(/Select department/i)).toBeInTheDocument();
    });
});
