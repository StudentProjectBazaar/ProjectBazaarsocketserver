import React from 'react';

interface OrangeCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    indeterminate?: boolean;
    className?: string;
    id?: string;
}

const OrangeCheckbox: React.FC<OrangeCheckboxProps> = ({ 
    checked, 
    onChange, 
    indeterminate = false,
    className = '',
    id 
}) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <>
            <style>{`
                input[type="checkbox"].orange-checkbox {
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    width: 1rem;
                    height: 1rem;
                    border: 2px solid #d1d5db;
                    border-radius: 0.25rem;
                    background-color: white;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s ease-in-out;
                }
                
                input[type="checkbox"].orange-checkbox:hover {
                    border-color: #f97316;
                    background-color: #fff7ed;
                }
                
                input[type="checkbox"].orange-checkbox:checked {
                    background-color: #f97316;
                    border-color: #f97316;
                }
                
                input[type="checkbox"].orange-checkbox:checked::after {
                    content: '';
                    position: absolute;
                    left: 4px;
                    top: 1px;
                    width: 4px;
                    height: 8px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }
                
                input[type="checkbox"].orange-checkbox:indeterminate {
                    background-color: #f97316;
                    border-color: #f97316;
                }
                
                input[type="checkbox"].orange-checkbox:indeterminate::after {
                    content: '';
                    position: absolute;
                    left: 2px;
                    top: 5px;
                    width: 8px;
                    height: 2px;
                    background-color: white;
                }
                
                input[type="checkbox"].orange-checkbox:focus {
                    outline: none;
                    ring: 2px;
                    ring-color: #f97316;
                    ring-offset: 2px;
                }
            `}</style>
            <input
                ref={checkboxRef}
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className={`orange-checkbox ${className}`}
            />
        </>
    );
};

export default OrangeCheckbox;

