import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";

interface ApplicationsSearchProps {
	onChange: (value: string) => void;
	placeholder?: string;
}

const ApplicationsSearch = ({
	onChange,
	placeholder = "Search applications...",
}: ApplicationsSearchProps) => {
	const [inputValue, setInputValue] = useState("");
	const debouncedValue = useDebouncedValue(inputValue, 300);

	useEffect(() => {
		if (debouncedValue === inputValue) {
			onChange(debouncedValue);
		}
	}, [debouncedValue, onChange, inputValue]);

	return (
		<TextField
			size="small"
			placeholder={placeholder}
			value={inputValue}
			onChange={(e) => setInputValue(e.target.value)}
			InputProps={{
				startAdornment: (
					<InputAdornment position="start">
						<SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
					</InputAdornment>
				),
			}}
			sx={{ minWidth: 200 }}
		/>
	);
};

export default ApplicationsSearch;
