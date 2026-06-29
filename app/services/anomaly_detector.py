import pandas as pd

class AnomalyDetector:
    """
    Service responsible for executing business rules to flag anomalous transactions.
    """
    DOMESTIC_BRANDS = {"SWIGGY", "OLA", "IRCTC"}

    def detect(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Executes anomaly detection rules sequentially.
        """
        df = df.copy()
        df['is_anomaly'] = False
        df['anomaly_reason'] = None

        self._rule_1_high_amount_outlier(df)
        self._rule_2_domestic_usd_usage(df)

        return df

    def _rule_1_high_amount_outlier(self, df: pd.DataFrame):
        """
        Rule 1: Flag transactions where amount > 3x account median.
        """
        if 'account_id' not in df.columns or 'amount' not in df.columns:
            return

        medians = df.groupby('account_id')['amount'].median()
        
        for account_id, median_val in medians.items():
            if pd.isna(median_val):
                continue
            
            threshold = median_val * 3
            mask = (df['account_id'] == account_id) & (df['amount'] > threshold)
            self._apply_anomaly(df, mask, "Amount exceeds 3x account median")

    def _rule_2_domestic_usd_usage(self, df: pd.DataFrame):
        """
        Rule 2: Flag rows where currency is USD but merchant is a domestic brand.
        """
        if 'currency' not in df.columns or 'merchant' not in df.columns:
            return

        upper_merchants = df['merchant'].astype(str).str.upper()
        mask = (df['currency'] == 'USD') & (upper_merchants.isin(self.DOMESTIC_BRANDS))
        
        self._apply_anomaly(df, mask, "USD currency used for domestic brand")

    def _apply_anomaly(self, df: pd.DataFrame, mask: pd.Series, reason: str):
        """
        Helper method to apply an anomaly flag and append the reason.
        """
        df.loc[mask, 'is_anomaly'] = True
        
        existing_reasons = df.loc[mask, 'anomaly_reason']
        df.loc[mask, 'anomaly_reason'] = existing_reasons.apply(
            lambda x: reason if pd.isna(x) or not x else f"{x} | {reason}"
        )
