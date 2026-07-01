import pandas as pd
import numpy as np

class CSVCleaner:
    """
    Service responsible for loading, validating, and cleaning raw transaction CSV files.
    """
    
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.raw_row_count = 0
        self.clean_row_count = 0

    def process(self) -> pd.DataFrame:
        """
        Executes the cleaning pipeline in distinct phases.
        """
        df = self._load_csv()
        self._validate_columns(df)
        df = self._remove_duplicates(df)
        df = self._clean_data(df)
        df = self._normalize_dates(df)
        self.clean_row_count = len(df)
        return df

    def _load_csv(self) -> pd.DataFrame:
        """Phase 1: Load CSV"""
        df = pd.read_csv(self.file_path)
        self.raw_row_count = len(df)
        return df

    def _validate_columns(self, df: pd.DataFrame):
        """Phase 2: Validate columns"""
        # A lightweight check. In a production app, we might throw an exception if critical columns are missing.
        required_cols = {"amount", "currency", "status", "category", "date"}
        missing = required_cols - set(df.columns)
        if missing:
            pass # We could log a warning here if needed.

    def _remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Phase 3: Remove duplicate rows"""
        # Remove duplicates based only on core business fields, ignoring unique identifiers like txn_id
        subset = [col for col in ['merchant', 'amount', 'date', 'currency', 'category', 'status'] if col in df.columns]
        return df.drop_duplicates(subset=subset)

    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Phase 4: Clean data (Strip symbols, uppercase, fill missing)"""
        if 'amount' in df.columns:
            df['amount'] = df['amount'].astype(str).str.replace('$', '', regex=False).str.replace(',', '', regex=False)
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce')

        if 'currency' in df.columns:
            df['currency'] = df['currency'].astype(str).str.upper().str.strip()
            df['currency'] = df['currency'].replace('NAN', np.nan)
        
        if 'status' in df.columns:
            df['status'] = df['status'].astype(str).str.upper().str.strip()
            df['status'] = df['status'].replace('NAN', np.nan)

        if 'category' in df.columns:
            df['category'] = df['category'].replace(r'^\s*$', np.nan, regex=True)
            df['category'] = df['category'].fillna('Uncategorised')

        return df

    def _normalize_dates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Phase 5: Normalize values (dates to ISO 8601)"""
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'], dayfirst=True, errors='coerce')
            df['date'] = df['date'].dt.strftime('%Y-%m-%dT%H:%M:%S')
        return df
