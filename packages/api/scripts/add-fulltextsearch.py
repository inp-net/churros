#!/usr/bin/env python
from pathlib import Path

NEWLINE = "\n"

here = Path(__file__).parent

real_table_mapping = {"Uploader": "User", "Member": "User", "Author": "User"}


def table_and_column(dot_pathed_column: str) -> tuple[str, str]:
    table, column = dot_pathed_column.split(".")
    return table[0].upper() + table[1:], column


def variable_name(table: str, column: str) -> str:
    return f"{table.lower()}_{column}"


def is_dotpathed(column: str) -> bool:
    return "." in column


def weighted_tsvector_expression(column: str, weight: str) -> str:
    if is_dotpathed(column):
        table, column = table_and_column(column)
        column_expression = variable_name(table, column)
    else:
        column_expression = f'NEW."{column}"'

    return f"setweight(to_tsvector('french', coalesce({column_expression}::text, '')), '{weight}')"


def update_function_and_trigger(
    table: str,
    a_weighted_columns: list[str] | None = None,
    b_weighted_columns: list[str] | None = None,
    c_weighted_columns: list[str] | None = None,
    d_weighted_columns: list[str] | None = None,
) -> str:
    columns_by_weight = (
        {column.strip(): "A" for column in a_weighted_columns or []}
        | {column.strip(): "B" for column in b_weighted_columns or []}
        | {column.strip(): "C" for column in c_weighted_columns or []}
        | {column.strip(): "D" for column in d_weighted_columns or []}
    )
    dot_pathed_columns = [c for c in columns_by_weight.keys() if "." in c]

    dot_pathed_declarations = []
    for dot_pathed_column in dot_pathed_columns:
        tab, column = table_and_column(dot_pathed_column)
        dot_pathed_declarations.append(f"{variable_name(tab, column)} text := '';")

    dot_pathed_definitions = []
    for dot_pathed_column in dot_pathed_columns:
        tab, column = table_and_column(dot_pathed_column)
        real_tab = real_table_mapping.get(tab, tab)
        dot_pathed_definitions.append(
            f"""{variable_name(tab, column)} := (
                SELECT "{column}"
                FROM "{real_tab}"
                WHERE "{real_tab}"."id" = NEW."{tab.lower()}Id"
            );
            """
        )

    return f"""
-- {table}
CREATE OR REPLACE FUNCTION update_{table.lower()}_search() RETURNS TRIGGER AS $$
DECLARE
    {NEWLINE.join(dot_pathed_declarations)}
BEGIN
    {NEWLINE.join(dot_pathed_definitions)}

    NEW."search" := {'||'.join(weighted_tsvector_expression(*item) for item in columns_by_weight.items())};

    RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_{table.lower()}_search_trigger before INSERT OR UPDATE ON "{table}" FOR EACH ROW EXECUTE PROCEDURE update_{table.lower()}_search();
"""


print("Separate columns with spaces.")

Path(here.parent / "src" / "fulltextsearch.sql").write_text(
    Path(here.parent / "src" / "fulltextsearch.sql").read_text()
    + "\n\n\n"
    + update_function_and_trigger(
        input("     Table: "),
        a_weighted_columns=input("A-weighted: ").strip().split(" "),
        b_weighted_columns=input("B-weighted: ").strip().split(" "),
        c_weighted_columns=input("C-weighted: ").strip().split(" "),
        d_weighted_columns=input("D-weighted: ").strip().split(" "),
    )
)
