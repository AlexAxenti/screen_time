import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";

interface ApplicationsSearchProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

const ApplicationsSearch = ({
	value,
	onChange,
	placeholder = "Search applications...",
}: ApplicationsSearchProps) => {
	return (
		<TextField
			size="small"
			placeholder={placeholder}
			value={value}
			onChange={(e) => onChange(e.target.value)}
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
