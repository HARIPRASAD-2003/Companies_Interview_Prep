"use client";
import React, { useState, useMemo } from "react";
import { Autocomplete, Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Typography, Chip, TextField, IconButton, Tooltip, Pagination } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { QuestionsData, CompaniesData } from "../types";

interface HomeProps {
    questionsData: QuestionsData;
    companiesData: CompaniesData;
}

const difficultyColors: Record<string, "default" | "success" | "warning" | "error"> = {
    Easy: "success",
    Medium: "warning",
    Hard: "error",
};

export function QuestionsTable({ questionsData, companiesData }: HomeProps) {
    // Selected company is strictly a known company or "All"
    const [selectedCompany, setSelectedCompany] = useState<string>("All");
    // Autocomplete input value can be free text, so separate from selectedCompany
    const [companyInputValue, setCompanyInputValue] = useState<string>("All");

    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
    const [selectedTag, setSelectedTag] = useState<string>("All");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const rowsPerPage = 15;

    // Extract unique difficulties sorted
    const difficulties = useMemo(() => {
        const setDiff = new Set<string>();
        Object.values(questionsData.questions).forEach((q) => setDiff.add(q.difficulty));
        return Array.from(setDiff).sort();
    }, [questionsData]);

    // Extract unique tags (not displayed but used for filtering)
    const allTags = useMemo(() => {
  console.log("Computing allTags for company:", selectedCompany);
  const tagSet = new Set<string>();

  Object.values(questionsData.questions).forEach((q) => {
    if (selectedCompany === "All") {
      Object.values(q.companyStats).forEach((stats) => {
        stats.tags.forEach((tag) => tagSet.add(tag));
      });
    } else {
      const stats = q.companyStats[selectedCompany];
      if (stats && Array.isArray(stats.tags)) {
        stats.tags.forEach((tag) => tagSet.add(tag));
      }
    }
  });

  return Array.from(tagSet).sort();
}, [questionsData, selectedCompany]);



    // Handle company selection - only update selectedCompany when user chooses an option
    const handleCompanyChange = (event: React.SyntheticEvent, newValue: string | null) => {
        if (newValue && (newValue === "All" || companiesData.companies.includes(newValue))) {
            setSelectedCompany(newValue);
            setPage(1);
        } else {
            // Invalid company input, reset to "All"
            setSelectedCompany("All");
            setPage(1);
        }
    };

    // Handle input value changes (typing)
    const handleCompanyInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
        setCompanyInputValue(newInputValue);
    };

    const handleDifficultyChange = (event: SelectChangeEvent) => {
        setSelectedDifficulty(event.target.value as string);
        setPage(1);
    };

    const handleTagChange = (event: SelectChangeEvent) => {
        setSelectedTag(event.target.value as string);
        setPage(1);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    // Filter questions based on selectedCompany, difficulty, tag, and search
    const filteredQuestions = useMemo(() => {
        // console.log("Checking tags", selectedTag);
        return Object.entries(questionsData.questions).filter(([id, q]) => {

            // Company filter
            if (selectedCompany !== "All" && !(selectedCompany in q.companyStats)) {
                return false;
            }

            // Difficulty filter
            if (selectedDifficulty !== "All" && q.difficulty !== selectedDifficulty) {
                return false;
            }

            // Tag filter with case-insensitive match
            if (selectedTag !== "All") {
                if (selectedCompany === "All") {
                    // No company selected, so tags can't be reliably filtered (or skip filtering by tag)
                    // You can either skip tag filtering or:
                    return true; // no filtering by tag when no company selected
                } else {
                    const stats = q.companyStats[selectedCompany];
                    if (!stats || !Array.isArray(stats.tags)) {
                        return false; // no data or tags for selected company means no match
                    }
                    const hasTag = stats.tags.some(
                        (tag) => tag.toLowerCase() === selectedTag.toLowerCase()
                    );
                    if (!hasTag) return false;
                }
            }


            // Search filter on title or id (case insensitive)
            if (
                searchTerm.trim() &&
                !(
                    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    id.toLowerCase().includes(searchTerm.toLowerCase())
                )
            ) {
                return false;
            }

            return true;
        });

    }, [questionsData, selectedCompany, selectedDifficulty, selectedTag, searchTerm]);


    // Pagination slice
    const paginatedQuestions = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredQuestions.slice(start, start + rowsPerPage);
    }, [filteredQuestions, page]);

    const [, forceUpdate] = React.useState(0);

React.useEffect(() => {
  forceUpdate((n) => n + 1);
}, [selectedCompany]);


    return (
        <Box sx={{ p: 3, maxWidth: "100%", overflowX: "auto" }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                LeetCode Interview Prep Tracker
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    mb: 3,
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <TextField
                    variant="outlined"
                    size="small"
                    label="Search by Title or ID"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ minWidth: 240, flexGrow: 1, maxWidth: 400 }}
                />

                <FormControl sx={{ minWidth: 180, flexGrow: 1, maxWidth: 300 }}>
                    <Autocomplete
                        freeSolo
                        clearOnEscape
                        options={["All", ...companiesData.companies]}
                        value={selectedCompany}
                        inputValue={companyInputValue}
                        onChange={handleCompanyChange}
                        onInputChange={handleCompanyInputChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Company"
                                size="small"
                                error={
                                    selectedCompany !== "All" &&
                                    selectedCompany !== "" &&
                                    !companiesData.companies.includes(selectedCompany)
                                }
                                helperText={
                                    selectedCompany !== "All" &&
                                        selectedCompany !== "" &&
                                        !companiesData.companies.includes(selectedCompany)
                                        ? "Company data unavailable"
                                        : ""
                                }
                            />
                        )}
                        ListboxProps={{ style: { maxHeight: "200px" } }}
                    />
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="difficulty-select-label">Difficulty</InputLabel>
                    <Select
                        labelId="difficulty-select-label"
                        value={selectedDifficulty}
                        label="Difficulty"
                        onChange={handleDifficultyChange}
                        size="small"
                    >
                        <MenuItem value="All">All</MenuItem>
                        {difficulties.map((diff) => (
                            <MenuItem key={diff} value={diff}>
                                {diff}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="tag-select-label">Tag</InputLabel>
                    <Select
                        labelId="tag-select-label"
                        value={selectedTag}
                        label="Tag"
                        onChange={handleTagChange}
                        size="small"
                    >
                        <MenuItem value="All">All</MenuItem>
                        {allTags.map((tag) => (
                            <MenuItem key={tag} value={tag}>
                                {tag}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer
                component={Paper}
                sx={{
                    maxHeight: 650,
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
            >
                <Table stickyHeader size="small" aria-label="questions table" sx={{ tableLayout: "fixed" }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 60, fontWeight: "bold" }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
                            <TableCell sx={{ width: 120, fontWeight: "bold" }}>Difficulty</TableCell>
                            <TableCell sx={{ width: 80, fontWeight: "bold", textAlign: "center" }}>Link</TableCell>
                            {selectedCompany === "All" && <TableCell sx={{ fontWeight: "bold" }}>Companies</TableCell>}
                            {selectedCompany !== "All" && (
                                <>
                                    <TableCell sx={{ width: 90, fontWeight: "bold" }}>Accuracy %</TableCell>
                                    <TableCell sx={{ width: 90, fontWeight: "bold" }}>Frequency %</TableCell>
                                </>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedQuestions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={selectedCompany === "All" ? 5 : 7} align="center" sx={{ py: 6 }}>
                                    No questions found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedQuestions.map(([id, q]) => {
                                const stats = selectedCompany === "All" ? null : q.companyStats[selectedCompany];
                                return (
                                    <TableRow
                                        key={id}
                                        hover
                                        sx={{
                                            cursor: "default",
                                            "&:hover": { backgroundColor: "rgba(25,118,210,0.08)" },
                                        }}
                                    >
                                        <TableCell
                                            sx={{
                                                fontFamily: "monospace",
                                                fontWeight: 600,
                                                color: "text.secondary",
                                            }}
                                        >
                                            {id}
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                            title={q.title}
                                        >
                                            {q.title}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={q.difficulty}
                                                size="small"
                                                color={difficultyColors[q.difficulty] ?? "default"}
                                                sx={{ fontWeight: 600, minWidth: 70 }}
                                            />
                                        </TableCell>

                                        <TableCell align="center">
                                            <Tooltip title="Open question in LeetCode">
                                                <IconButton
                                                    component={Link}
                                                    href={q.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    size="small"
                                                    aria-label="Open question"
                                                >
                                                    <OpenInNewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>

                                        {selectedCompany === "All" ? (
                                            <TableCell
                                                sx={{
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    color: "text.secondary",
                                                }}
                                            >
                                                {Object.keys(q.companyStats).join(", ")}
                                            </TableCell>
                                        ) : stats ? (
                                            <>
                                                <TableCell>{stats.accuracy.toFixed(2)}%</TableCell>
                                                <TableCell>{stats.frequency.toFixed(2)}%</TableCell>
                                            </>
                                        ) : (
                                            <TableCell colSpan={2} align="center">
                                                No data
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box
                sx={{
                    mt: 3,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Pagination
                    count={Math.ceil(filteredQuestions.length / rowsPerPage)}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                    siblingCount={1}
                    boundaryCount={1}
                    size="medium"
                />
            </Box>
        </Box>
    );
}
