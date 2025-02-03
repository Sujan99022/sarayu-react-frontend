import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  Box,
  Chip,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Popper,
} from "@mui/material";
import apiClient from "../../../api/apiClient";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import DualGraphPlot from "../graphs/dualgraph/DualGraphPlot";
import { IoClose } from "react-icons/io5";
import "./loader.css";

const DualTopicDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useSelector((state) => state.userSlice);
  const [allTags, setAllTags] = useState([]);

  // Extract display name from tag format
  const getDisplayName = (tag) => {
    return tag.split("|")[0].split("/")[2] || tag;
  };

  useEffect(() => {
    if (user.id) {
      fetchUserDetails();
    }
  }, [user.id]);

  const fetchUserDetails = async () => {
    try {
      const res = await apiClient.get(`/auth/${user.role}/${user.id}`);
      setAllTags(res?.data?.data?.topics);
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to fetch user details"
      );
    }
  };

  const [selectedTags, setSelectedTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleCloseGraph = () => {
    setIsSubmitted(false);
    setSelectedTags([]);
    setInputValue("");
  };

  const handleTagRemove = (tagToRemove) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const CustomPopper = (props) => {
    return (
      <Popper
        {...props}
        placement="bottom-start"
        sx={{
          minWidth: `${props.anchorEl?.clientWidth}px !important`,
          width: "fit-content !important",
          maxWidth: "90vw",
          zIndex: 1300,
        }}
        modifiers={[
          {
            name: "flip",
            enabled: false,
          },
          {
            name: "preventOverflow",
            enabled: true,
          },
        ]}
      />
    );
  };

  return (
    <div>
      {!isSubmitted ? (
        <Box
          sx={{
            p: isMobile ? 2 : 3,
            width: "95vw",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "100vh",
            justifyContent: "flex-start",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
            Select 2 Tags to Plot
          </Typography>

          {!isLoading && (
            <>
              {selectedTags.length < 2 && (
                <Autocomplete
                  multiple
                  options={allTags}
                  value={selectedTags}
                  onChange={(_, newValue) => {
                    setSelectedTags(newValue.slice(0, 2));
                  }}
                  inputValue={inputValue}
                  onInputChange={(_, newInputValue) => {
                    setInputValue(newInputValue);
                  }}
                  getOptionLabel={(option) => getDisplayName(option)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search tags"
                      placeholder="Type to search..."
                      sx={{
                        width: "100%",
                        maxWidth: 600,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          transition: "0.3s",
                        },
                      }}
                    />
                  )}
                  PopperComponent={CustomPopper}
                  renderTags={() => null}
                  filterOptions={(options, state) =>
                    options.filter((option) =>
                      getDisplayName(option)
                        .toLowerCase()
                        .includes(state.inputValue.toLowerCase())
                    )
                  }
                  sx={{
                    mb: 2,
                    width: "100%",
                    maxWidth: 600,
                  }}
                />
              )}

              {selectedTags.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mb: 2,
                    minHeight: "40px",
                    flexWrap: "wrap",
                    width: "100%",
                    maxWidth: 600,
                    justifyContent: "center",
                    px: isMobile ? 1 : 0,
                  }}
                >
                  {selectedTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={getDisplayName(tag)}
                      onDelete={() => handleTagRemove(tag)}
                      sx={{
                        borderRadius: "6px",
                        bgcolor: "primary.main",
                        color: "white",
                        "& .MuiChip-deleteIcon": {
                          color: "white",
                          "&:hover": { color: "#e0e0e0" },
                        },
                      }}
                    />
                  ))}
                </Box>
              )}

              {selectedTags.length === 2 && (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    mt: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      py: 1,
                      px: 3,
                      borderRadius: "8px",
                      fontWeight: "bold",
                      boxShadow: 2,
                      transition: "0.3s",
                      width: "fit-content",
                      "&:hover": { transform: "translateY(-2px)" },
                    }}
                  >
                    Plot Graph
                  </Button>
                </Box>
              )}
            </>
          )}

          {isLoading && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
                width: "100%",
              }}
            >
              <div className="dtd_loader"></div>
              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  color: "text.secondary",
                  textAlign: "center",
                  px: 2,
                }}
              >
                Preparing your graph...
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ width: "97vw", height: "100vh", position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              p: 1,
            }}
          >
            <IconButton
              onClick={handleCloseGraph}
              size={isMobile ? "small" : "medium"}
            >
              <IoClose color="red" size={24} />
            </IconButton>
          </Box>
          <DualGraphPlot
            topic1={selectedTags[0]}
            topic2={selectedTags[1]}
            height={window.innerHeight - (isMobile ? 150 : 120)}
            width={window.innerWidth - (isMobile ? 10 : 20)}
          />
        </Box>
      )}
    </div>
  );
};

export default DualTopicDashboard;
