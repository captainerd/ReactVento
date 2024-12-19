import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const ComboSelect = ({ name, onChange, values, selected, className }) => {
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("");
    const prevValue = useRef(null);
    // Pre-select the initial value based on the 'selected' prop
    useEffect(() => {

        if (typeof values.find == "function") {

            const preSelected = values.find((value) => parseInt(value.value) === parseInt(selected));
            if (preSelected) {
                setSelectedValue(preSelected.label);
                if (selected !== prevValue.current) {
                    onChange(preSelected)
                    prevValue.current = selected;
                }
            }
        }
        if (selected == -1) {
            setSelectedValue("");
        }
    }, [selected, values]);

    const handleSelect = (value) => {
        setOpen(false);
        setSelectedValue(value.label);
        onChange(value);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between ${className}`}
                >
                    {selectedValue || `Select ${name}`}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder={`Search ${name}...`} className="h-9" />
                    <CommandList>
                        <CommandEmpty>No {name} found.</CommandEmpty>
                        <CommandGroup>
                            {values.map && values.map((value) => (
                                <CommandItem
                                    key={value.value}
                                    onSelect={() => handleSelect(value)}
                                >
                                    {value.label}
                                    <Check
                                        className={`ml-auto ${selectedValue === value.label ? "opacity-100" : "opacity-0"}`}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default ComboSelect;
