# In-memory storage for the SimuCast backend.
# In a production app, replace these with a database (e.g., PostgreSQL + SQLAlchemy).

# dataset_id -> { 'df': DataFrame, 'name': str, 'type': 'Real'|'Synthetic', 'quality': dict }
datasets_store: dict = {}

# model_id -> {
#   'pipeline': sklearn Pipeline,
#   'feature_cols': List[str],
#   'target_col': str,
#   'task_type': 'classification'|'regression',
#   'model_type': str,
#   'feature_config': {col: {min, max, mean, std}},   # derived from uploaded dataset
#   'dataset_id': str,
#   'label_encoder': LabelEncoder|None,
#   'metrics': dict,
# }
models_store: dict = {}

# scenario_id -> scenario dict
scenarios_store: dict = {}
