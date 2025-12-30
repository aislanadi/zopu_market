import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  mobileLabel?: string; // Label personalizado para mobile
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyMessage?: string;
  mobileCardClassName?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "Nenhum registro encontrado",
  mobileCardClassName = "",
}: ResponsiveTableProps<T>) {
  const getCellValue = (row: T, column: Column<T>): ReactNode => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor] as ReactNode;
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`text-left p-4 font-semibold ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row, rowIndex)}
                className="border-b hover:bg-muted/50 transition-colors"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`p-4 ${column.className || ""}`}
                  >
                    {getCellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((row, rowIndex) => (
          <Card key={keyExtractor(row, rowIndex)} className={mobileCardClassName}>
            <CardContent className="p-4 space-y-3">
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="flex justify-between items-start gap-4">
                  <span className="font-semibold text-sm text-muted-foreground min-w-[100px]">
                    {column.mobileLabel || column.header}:
                  </span>
                  <span className="text-sm text-right flex-1">
                    {getCellValue(row, column)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
