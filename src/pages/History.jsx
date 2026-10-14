import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

// Get the image filename.
function getImageFilename(image) {
    return (
        image?.originalName ||
        image?.originalFilename ||
        image?.originalFileName ||
        image?.fileName ||
        image?.filename ||
        image?.name ||
        "Untitled image"
    );
}

// Get the image upload date and time.
function getUploadedTime(image) {
    const timestamp =
        image?.uploadedAt ||
        image?.createdAt ||
        image?.timestamp ||
        image?.created_at ||
        image?.uploaded_at ||
        image?.analyzedAt;

    if (!timestamp) {
        return "Time unavailable";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "Time unavailable";
    }

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

// Get the image ID.
function getImageId(image) {
    return image?._id || image?.id || image?.imageId;
}

// Get the image URL.
function getImageUrl(image) {
    const value =
        image?.originalImage ||
        image?.imageUrl ||
        image?.image ||
        image?.url ||
        image?.path;

    if (typeof value === "string") {
        return api.resolveUrl(value);
    }

    if (value && typeof value === "object") {
        const url = value.url || value.path || value.imageUrl;

        if (typeof url === "string") {
            return api.resolveUrl(url);
        }
    }

    return "";
}

// Extract image records from different response formats.
function getImageRecords(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.images)) {
        return response.images;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.images)) {
        return response.data.images;
    }

    if (Array.isArray(response?.results)) {
        return response.results;
    }

    return [];
}

function History({ onLogout }) {
    const navigate = useNavigate();

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    // Custom delete confirmation modal state.
    const [imageToDelete, setImageToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // Fetch the user's image history.
    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.getMyImages();
            const records = getImageRecords(response);

            setImages(records);
        } catch (err) {
            console.error("History fetch error:", err);

            setError(
                "Unable to load your image history. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // Open an image's analysis page.
    const handleImageClick = (image) => {
        const imageId = getImageId(image);

        navigate("/analysis", {
            state: {
                imageId,
                originalImage: getImageUrl(image),
                filename: getImageFilename(image),
                fileSize: image?.fileSize,
                fileType: image?.fileType,
                detectionResult:
                    image?.detectionResult ||
                    image?.result ||
                    image?.analysisResult ||
                    null,
                timestamp:
                    image?.uploadedAt ||
                    image?.createdAt ||
                    image?.timestamp ||
                    image?.analyzedAt ||
                    null,
                fromHistory: true,
                historyDetail: image,
            },
        });
    };

    // Open the custom delete confirmation modal.
    const openDeleteModal = (event, image) => {
        event.stopPropagation();

        setDeleteError("");
        setImageToDelete(image);
        setShowDeleteModal(true);
    };

    // Close the custom delete confirmation modal.
    const closeDeleteModal = () => {
        if (deletingId !== null) {
            return;
        }

        setShowDeleteModal(false);
        setImageToDelete(null);
        setDeleteError("");
    };

    // Delete an image after confirmation.
    const handleDeleteImage = async () => {
        if (!imageToDelete) {
            return;
        }

        const imageId = getImageId(imageToDelete);

        if (!imageId) {
            setDeleteError("Unable to find this image's ID.");
            return;
        }

        try {
            setDeletingId(imageId);
            setDeleteError("");

            const token = api.getAuthToken();

            const response = await fetch(
                api.resolveUrl(`/api/images/${imageId}`),
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: token
                        ? {
                              Authorization: `Bearer ${token}`,
                          }
                        : {},
                }
            );

            if (!response.ok) {
                let message = `Delete failed (${response.status})`;

                try {
                    const data = await response.json();
                    message = data.message || data.error || message;
                } catch {
                    // Keep the default error message.
                }

                throw new Error(message);
            }

            // Remove the deleted image from the visible history.
            setImages((previousImages) =>
                previousImages.filter(
                    (item) => getImageId(item) !== imageId
                )
            );

            // Close the modal after successful deletion.
            setShowDeleteModal(false);
            setImageToDelete(null);
            setDeleteError("");
        } catch (err) {
            console.error("Delete image error:", err);

            setDeleteError(
                err.message || "Unable to delete this image. Please try again."
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#0b1120",
                color: "#f1f5f9",
            }}
        >

            <main
                style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                    padding: "48px 24px",
                }}
            >
                <h1
                    style={{
                        fontSize: "32px",
                        fontWeight: "700",
                        marginBottom: "10px",
                    }}
                >
                    Detection History
                </h1>

                <p
                    style={{
                        color: "#94a3b8",
                        marginBottom: "32px",
                    }}
                >
                    View and manage your previously uploaded images.
                </p>

                {loading && (
                    <p style={{ color: "#cbd5e1" }}>
                        Loading your history...
                    </p>
                )}

                {!loading && error && (
                    <div
                        style={{
                            padding: "20px",
                            backgroundColor: "#1e293b",
                            borderRadius: "10px",
                        }}
                    >
                        <p style={{ color: "#fca5a5" }}>{error}</p>

                        <button
                            type="button"
                            onClick={fetchHistory}
                            style={{
                                marginTop: "12px",
                                padding: "10px 18px",
                                border: "none",
                                borderRadius: "6px",
                                backgroundColor: "#2563eb",
                                color: "#ffffff",
                                cursor: "pointer",
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && images.length === 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "48px 20px",
                            backgroundColor: "#111827",
                            border: "1px solid #263244",
                            borderRadius: "12px",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "21px",
                                marginBottom: "12px",
                            }}
                        >
                            No Detection History Yet
                        </h2>

                        <p
                            style={{
                                color: "#94a3b8",
                                marginBottom: "24px",
                            }}
                        >
                            Your uploaded images will appear here.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            style={{
                                padding: "11px 20px",
                                backgroundColor: "#2563eb",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "7px",
                                cursor: "pointer",
                            }}
                        >
                            Upload an Image
                        </button>
                    </div>
                )}

                {!loading && !error && images.length > 0 && (
                    <div
                        style={{
                            border: "1px solid #263244",
                            borderRadius: "12px",
                            overflow: "hidden",
                            backgroundColor: "#111827",
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "minmax(0, 1fr) minmax(0, 1fr) auto",
                                gap: "16px",
                                padding: "18px 20px",
                                backgroundColor: "#1e293b",
                                borderBottom: "1px solid #334155",
                                fontWeight: "600",
                                color: "#cbd5e1",
                            }}
                        >
                            <span>Image</span>
                            <span>Uploaded Time</span>
                            <span>Action</span>
                        </div>

                        {images.map((image, index) => {
                            const imageId = getImageId(image);

                            return (
                                <div
                                    key={imageId || index}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "minmax(0, 1fr) minmax(0, 1fr) auto",
                                        alignItems: "center",
                                        gap: "16px",
                                        padding: "18px 20px",
                                        borderBottom:
                                            index === images.length - 1
                                                ? "none"
                                                : "1px solid #263244",
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleImageClick(image)
                                        }
                                        style={{
                                            padding: 0,
                                            border: "none",
                                            background: "transparent",
                                            color: "#60a5fa",
                                            textAlign: "left",
                                            fontSize: "14px",
                                            overflowWrap: "anywhere",
                                            cursor: "pointer",
                                            textDecoration: "underline",
                                        }}
                                    >
                                        {getImageFilename(image)}
                                    </button>

                                    <span
                                        style={{
                                            color: "#cbd5e1",
                                            fontSize: "13px",
                                        }}
                                    >
                                        {getUploadedTime(image)}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={deletingId === imageId}
                                        onClick={(event) =>
                                            openDeleteModal(event, image)
                                        }
                                        style={{
                                            padding: "8px 12px",
                                            backgroundColor: "#dc2626",
                                            color: "#ffffff",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontSize: "13px",
                                            whiteSpace: "nowrap",
                                            opacity:
                                                deletingId === imageId
                                                    ? 0.6
                                                    : 1,
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Custom delete confirmation modal */}
            {showDeleteModal && imageToDelete && (
                <div
                    onClick={closeDeleteModal}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        padding: "20px",
                        backdropFilter: "blur(4px)",
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-modal-title"
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: "100%",
                            maxWidth: "420px",
                            padding: "28px",
                            borderRadius: "14px",
                            backgroundColor: "#111827",
                            border: "1px solid #334155",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
                        }}
                    >
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(220, 38, 38, 0.15)",
                                color: "#f87171",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "24px",
                                marginBottom: "18px",
                            }}
                            aria-hidden="true"
                        >
                            !
                        </div>

                        <h2
                            id="delete-modal-title"
                            style={{
                                color: "#f8fafc",
                                fontSize: "22px",
                                marginTop: 0,
                                marginBottom: "12px",
                            }}
                        >
                            Delete this image?
                        </h2>

                        <p
                            style={{
                                color: "#94a3b8",
                                lineHeight: 1.6,
                                marginBottom: "20px",
                                overflowWrap: "anywhere",
                            }}
                        >
                            Are you sure you want to delete{" "}
                            <strong style={{ color: "#e2e8f0" }}>
                                {getImageFilename(imageToDelete)}
                            </strong>
                            ? This action cannot be undone.
                        </p>

                        {deleteError && (
                            <p
                                role="alert"
                                style={{
                                    color: "#fca5a5",
                                    fontSize: "14px",
                                    marginBottom: "18px",
                                }}
                            >
                                {deleteError}
                            </p>
                        )}

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "12px",
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deletingId !== null}
                                style={{
                                    padding: "10px 18px",
                                    borderRadius: "7px",
                                    border: "1px solid #475569",
                                    backgroundColor: "transparent",
                                    color: "#e2e8f0",
                                    cursor:
                                        deletingId !== null
                                            ? "not-allowed"
                                            : "pointer",
                                    opacity:
                                        deletingId !== null ? 0.6 : 1,
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteImage}
                                disabled={deletingId !== null}
                                style={{
                                    padding: "10px 18px",
                                    borderRadius: "7px",
                                    border: "none",
                                    backgroundColor: "#dc2626",
                                    color: "#ffffff",
                                    cursor:
                                        deletingId !== null
                                            ? "not-allowed"
                                            : "pointer",
                                    opacity:
                                        deletingId !== null ? 0.6 : 1,
                                }}
                            >
                                {deletingId !== null
                                    ? "Deleting..."
                                    : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default History;