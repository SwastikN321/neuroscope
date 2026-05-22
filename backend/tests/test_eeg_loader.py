from pathlib import Path

import pytest

from eeg_loader import EEGParseError, parse_eeg_csv, parse_eeg_file


SAMPLE_CSV = Path(__file__).resolve().parents[2] / "sample_data" / "sample_eeg.csv"


def test_parse_sample_csv():
    data = parse_eeg_csv(SAMPLE_CSV.read_bytes(), "sample_eeg.csv")

    assert data["filename"] == "sample_eeg.csv"
    assert data["metadata"]["fileType"] == "csv"
    assert data["metadata"]["sampleCount"] == 31
    assert data["metadata"]["channelCount"] == 6
    assert "Fp1" in data["channels"]


def test_parse_file_rejects_unknown_extension():
    with pytest.raises(EEGParseError, match="CSV or EDF"):
        parse_eeg_file(b"not,eeg", "recording.txt")
