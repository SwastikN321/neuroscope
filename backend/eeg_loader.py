from __future__ import annotations

from io import BytesIO
import tempfile
from pathlib import Path
from typing import Any

import pandas as pd


TIME_COLUMN_CANDIDATES = ("time", "timestamp", "seconds", "sec", "t")
MAX_ROWS = 25_000
EDF_EXTENSIONS = {".edf"}


class EEGParseError(ValueError):
    """Raised when an uploaded file cannot be parsed as EEG data."""


def _detect_time_column(columns: list[str]) -> str | None:
    normalized = {column.strip().lower(): column for column in columns}
    for candidate in TIME_COLUMN_CANDIDATES:
        if candidate in normalized:
            return normalized[candidate]
    return None


def _downsample_frame(df: pd.DataFrame) -> tuple[pd.DataFrame, bool]:
    original_row_count = len(df)
    if original_row_count > MAX_ROWS:
        step = max(original_row_count // MAX_ROWS, 1)
        return df.iloc[::step].reset_index(drop=True), True

    return df, False


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

    df, downsampled = _downsample_frame(df)

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
            "fileType": "csv",
            "sampleCount": int(len(numeric_channels)),
            "channelCount": len(channels),
            "duration": float(time_values.iloc[-1] - time_values.iloc[0]) if len(time_values) > 1 else 0,
            "downsampled": downsampled,
        },
    }


def parse_eeg_edf(file_bytes: bytes, filename: str | None = None) -> dict[str, Any]:
    if not file_bytes:
        raise EEGParseError("The uploaded file is empty.")

    try:
        import mne
    except ImportError as exc:
        raise EEGParseError("EDF support requires MNE-Python to be installed.") from exc

    suffix = Path(filename or "uploaded.edf").suffix or ".edf"

    with tempfile.NamedTemporaryFile(suffix=suffix) as temp_file:
        temp_file.write(file_bytes)
        temp_file.flush()

        try:
            raw = mne.io.read_raw_edf(
                temp_file.name,
                preload=True,
                infer_types=True,
                verbose="ERROR",
            )
        except TypeError:
            raw = mne.io.read_raw_edf(temp_file.name, preload=True, verbose="ERROR")
        except Exception as exc:
            raise EEGParseError("Could not read the upload as an EDF file.") from exc

    if len(raw.ch_names) == 0:
        raise EEGParseError("The EDF file does not contain any channels.")

    try:
        picks = mne.pick_types(raw.info, eeg=True, exclude=[])
        if len(picks) == 0:
            picks = list(range(len(raw.ch_names)))
    except Exception:
        picks = list(range(len(raw.ch_names)))

    data = raw.get_data(picks=picks)
    channel_names = [raw.ch_names[index] for index in picks]
    time_values = raw.times

    df = pd.DataFrame(data.T, columns=channel_names)
    df.insert(0, "time", time_values)
    df, downsampled = _downsample_frame(df)

    time_series = df.pop("time")
    channels = {
        str(column): df[column].mul(1_000_000).round(6).tolist()
        for column in df.columns
    }

    return {
        "filename": filename or "uploaded.edf",
        "time": time_series.round(6).tolist(),
        "timeColumn": "seconds",
        "channels": channels,
        "metadata": {
            "fileType": "edf",
            "sampleCount": int(len(df)),
            "channelCount": len(channels),
            "duration": float(time_series.iloc[-1] - time_series.iloc[0]) if len(time_series) > 1 else 0,
            "samplingFrequency": float(raw.info.get("sfreq") or 0),
            "unit": "uV",
            "downsampled": downsampled,
        },
    }


def parse_eeg_file(file_bytes: bytes, filename: str | None = None) -> dict[str, Any]:
    extension = Path(filename or "").suffix.lower()

    if extension == ".csv":
        return parse_eeg_csv(file_bytes, filename)

    if extension in EDF_EXTENSIONS:
        return parse_eeg_edf(file_bytes, filename)

    raise EEGParseError("Please upload a CSV or EDF file.")
