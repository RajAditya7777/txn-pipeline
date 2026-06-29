"""initial_migration

Revision ID: 0001
Revises: 
Create Date: 2023-10-25 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('job',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('filename', sa.String(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('row_count_raw', sa.Integer(), nullable=True),
    sa.Column('row_count_clean', sa.Integer(), nullable=True),
    sa.Column('error_message', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_job_created_at'), 'job', ['created_at'], unique=False)
    op.create_index(op.f('ix_job_filename'), 'job', ['filename'], unique=False)
    op.create_index(op.f('ix_job_id'), 'job', ['id'], unique=False)
    op.create_index(op.f('ix_job_status'), 'job', ['status'], unique=False)

    op.create_table('job_summary',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('job_id', sa.Integer(), nullable=False),
    sa.Column('total_spend_inr', sa.Float(), nullable=True),
    sa.Column('total_spend_usd', sa.Float(), nullable=True),
    sa.Column('top_merchants', sa.JSON(), nullable=True),
    sa.Column('anomaly_count', sa.Integer(), nullable=False),
    sa.Column('narrative', sa.String(), nullable=True),
    sa.Column('risk_level', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['job_id'], ['job.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_job_summary_id'), 'job_summary', ['id'], unique=False)
    op.create_index(op.f('ix_job_summary_job_id'), 'job_summary', ['job_id'], unique=True)

    op.create_table('transaction',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('job_id', sa.Integer(), nullable=False),
    sa.Column('txn_id', sa.String(), nullable=True),
    sa.Column('date', sa.String(), nullable=True),
    sa.Column('merchant', sa.String(), nullable=True),
    sa.Column('amount', sa.Float(), nullable=True),
    sa.Column('currency', sa.String(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('category', sa.String(), nullable=True),
    sa.Column('account_id', sa.String(), nullable=True),
    sa.Column('is_anomaly', sa.Boolean(), nullable=False),
    sa.Column('anomaly_reason', sa.String(), nullable=True),
    sa.Column('llm_category', sa.String(), nullable=True),
    sa.Column('llm_raw_response', sa.String(), nullable=True),
    sa.Column('llm_failed', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['job_id'], ['job.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transaction_account_id'), 'transaction', ['account_id'], unique=False)
    op.create_index(op.f('ix_transaction_id'), 'transaction', ['id'], unique=False)
    op.create_index(op.f('ix_transaction_job_id'), 'transaction', ['job_id'], unique=False)
    op.create_index(op.f('ix_transaction_status'), 'transaction', ['status'], unique=False)
    op.create_index(op.f('ix_transaction_txn_id'), 'transaction', ['txn_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_transaction_txn_id'), table_name='transaction')
    op.drop_index(op.f('ix_transaction_status'), table_name='transaction')
    op.drop_index(op.f('ix_transaction_job_id'), table_name='transaction')
    op.drop_index(op.f('ix_transaction_id'), table_name='transaction')
    op.drop_index(op.f('ix_transaction_account_id'), table_name='transaction')
    op.drop_table('transaction')
    op.drop_index(op.f('ix_job_summary_job_id'), table_name='job_summary')
    op.drop_index(op.f('ix_job_summary_id'), table_name='job_summary')
    op.drop_table('job_summary')
    op.drop_index(op.f('ix_job_status'), table_name='job')
    op.drop_index(op.f('ix_job_id'), table_name='job')
    op.drop_index(op.f('ix_job_filename'), table_name='job')
    op.drop_index(op.f('ix_job_created_at'), table_name='job')
    op.drop_table('job')
