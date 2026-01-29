import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

type SortOption =
	| "name-asc"
	| "name-desc"
	| "duration-desc"
	| "duration-asc";

const sortOptions: { value: SortOption; label: string }[] = [
	{ value: "name-asc", label: "Application Name A-Z" },
	{ value: "name-desc", label: "Application Name Z-A" },
	{ value: "duration-desc", label: "Most Duration Used" },
	{ value: "duration-asc", label: "Least Duration Used" },
];

interface SortSelectorProps {
	value: SortOption;
	onChange: (value: SortOption) => void;
}

const SortSelector = ({ value, onChange }: SortSelectorProps) => {
	return (
		<FormControl size="small" sx={{ minWidth: 200 }}>
			<InputLabel id="sort-select-label">Sort By</InputLabel>
			<Select
				labelId="sort-select-label"
				value={value}
				label="Sort By"
				onChange={(e) => onChange(e.target.value as SortOption)}
			>
				{sortOptions.map((option) => (
					<MenuItem key={option.value} value={option.value}>
						{option.label}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

const parseSortOption = (
	sortOption: SortOption
): {
	sortValue: "window_exe" | "duration";
	sortDirection: "ASC" | "DESC";
} => {
	switch (sortOption) {
		case "name-asc":
			return { sortValue: "window_exe", sortDirection: "ASC" };
		case "name-desc":
			return { sortValue: "window_exe", sortDirection: "DESC" };
		case "duration-desc":
			return { sortValue: "duration", sortDirection: "DESC" };
		case "duration-asc":
			return { sortValue: "duration", sortDirection: "ASC" };
	}
};

export type { SortOption };
export { parseSortOption };
export default SortSelector;
