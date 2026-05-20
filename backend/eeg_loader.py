from __future__ import annotations

from io import BytesIO
from typing import Any

import pandas as pd


TIME_COLUMN_CANDIDATES = ("time", "timestamp", "seconds", "sec", "t")
MAX_ROWS = 25_000


class EEGParseError(ValueError):
    """Raised when an uploaded file cannot be parsed as simple EEG CSV data."""


def _detect_time_column(columns: list[str]) -> str | None:
    normalized = {column.strip().lower(): column for column in columns}
    for candidate in TIME_COLUMN_CANDIDATES:
        if candidate in normalized:
            return normalized[candidate]
    return None


def parse_eeg_csv(file_bytes: bytes, filename: str | None = None) -> dict[str, Any]:
    if not file_bytes:
        raise EEGParseError("The uploaded file is empty.")

    try:
        df = pd.read_csv(BytesIO(file_bytes))
    except Exception as exc:  # pandas provides several parser exceptions
        raise EEGParseError("Could not read the upload as a CSV file.") from exc

    if df.empty:
        raise EEGParseError("The CSV file does not contain any rows.")

    df = df.dropna(axis=1, how="all").dropna(axis=0, how="all")
    df.columns = [str(column).strip() for column in df.columns]

    original_row_count = len(df)
    if original_row_count > MAX_ROWS:
        step = max(original_row_count // MAX_ROWS, 1)
        df = df.iloc[::step].reset_index(drop=True)

    time_column = _detect_time_column(list(df.columns))
    if time_column:
        time_values = pd.to_numeric(df[time_column], errors="coerce")
        channel_source = df.drop(columns=[time_column])
    else:
        time_values = pd.Series(range(len(df)), name="sample")
        channel_source = df

    numeric_channels = channel_source.apply(pd.to_numeric, errors="coerce")
    numeric_channels = numeric_channels.dropna(axis=1, how="all")

    if numeric_channels.empty:
        raise EEGParseError("No numeric EEG channel columns were found.")

    numeric_channels = numeric_channels.interpolate(limit_direction="both").fillna(0)
    time_values = time_values.interpolate(limit_direction="both").bfill().ffill()

    channels = {
        str(column): numeric_channels[column].round(6).tolist()
        for column in numeric_channels.columns
    }

    return {
        "filename": filename or "uploaded.csv",
        "time": time_values.round(6).tolist(),
        "timeColumn": time_column or "sample",
        "channels": channels,
        "metadata": {
            "sampleCount": int(len(numeric_channels)),
            "channelCount": len(channels),
            "duration": float(time_values.iloc[-1] - time_values.iloc[0]) if len(time_values) > 1 else 0,
            "downsampled": original_row_count > MAX_ROWS,
        },
    }
