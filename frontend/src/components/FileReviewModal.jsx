import React, { useState, useEffect, useRef } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import api from "../services/api";
import { renderAsync } from "docx-preview";
import * as XLSX from "xlsx";

const getExtensionFromMime = (mimeType) => {
  if (!mimeType) return "";
  if (mimeType.includes("/pdf")) return "pdf";
  if (mimeType.includes("image/")) return mimeType.split("/")[1];
  if (mimeType.includes("wordprocessingml") || mimeType.includes("msword"))
    return "docx";
  if (mimeType.includes("spreadsheetml") || mimeType.includes("excel"))
    return "xlsx";
  return "";
};

const FilePreviewModal = ({
  open,
  onClose,
  fileId,
  fileName,
  mimeType,
  isAdmin = false,
}) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [rawBlob, setRawBlob] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [excelHtml, setExcelHtml] = useState("");

  const wordContainerRef = useRef(null);
  const fileType =
    getExtensionFromMime(mimeType) || fileName?.split(".").pop()?.toLowerCase();

  useEffect(() => {
    if (open && fileId) {
      fetchFile();
    }
    return () => {
      resetState();
    };
  }, [open, fileId]);

  useEffect(() => {
    if (fileType === "docx" && rawBlob && wordContainerRef.current) {
      renderAsync(rawBlob, wordContainerRef.current, null, {
        inWrapper: true,
        ignoreWidth: false,
      }).catch((err) => setError("Word file could not processed."));
    }
  }, [fileType, rawBlob]);

  const resetState = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setRawBlob(null);
    setExcelHtml("");
    setError(null);
  };

  const fetchFile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `${isAdmin ? "admin/" : ""}file/${fileId}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: mimeType });
      setRawBlob(blob);
      setBlobUrl(URL.createObjectURL(blob));

      if (fileType === "xlsx") {
        const arrayBuffer = await response.data.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const html = XLSX.utils.sheet_to_html(firstSheet);
        setExcelHtml(html);
      }
    } catch (err) {
      setError("File could not view.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!blobUrl) return;
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderViewer = () => {
    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!blobUrl) return null;

    if (fileType === "docx") {
      return (
        <Box
          sx={{
            bgcolor: "#fff",
            width: "100%",
            height: "100%",
            overflow: "auto",
          }}
        >
          <div ref={wordContainerRef} />
        </Box>
      );
    }

    if (fileType === "xlsx") {
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            overflow: "auto",
            bgcolor: "#fff",
            p: 2,
            "& table": { borderCollapse: "collapse", width: "100%" },
            "& td, th": { border: "1px solid #ddd", p: 1, minWidth: "100px" },
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: excelHtml }} />
        </Box>
      );
    }

    const docs = [{ uri: blobUrl, fileName: fileName, fileType: fileType }];
    return (
      <DocViewer
        documents={docs}
        pluginRenderers={DocViewerRenderers}
        style={{ height: "100%", width: "100%" }}
        config={{ header: { disableHeader: true, disableFileName: true } }}
      />
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: "90vh", display: "flex", flexDirection: "column" },
      }}
    >
      <style>{`.textLayer, .react-pdf__Page__textContent { display: none !important; }`}</style>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
          py: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {fileName}
          </Typography>
          {!loading && blobUrl && (
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
          )}
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          bgcolor: "#525659",
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {renderViewer()}
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewModal;
