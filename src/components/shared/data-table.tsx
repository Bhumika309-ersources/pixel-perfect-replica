import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  accessor?: (row: T) => string | number;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "right" | "center";
  hideBelow?: "sm" | "md" | "lg";
}

export interface DataTableFilter<T> {
  id: string;
  label: string;
  allLabel?: string;
  options: { value: string; label: string }[];
  accessor: (row: T) => string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  searchAccessor: (row: T) => string;
  filters?: DataTableFilter<T>[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyState?: ReactNode;
  toolbarExtra?: ReactNode;
  initialSort?: { key: string; dir: "asc" | "desc" } | null;
}

const HIDE = { sm: "hidden sm:table-cell", md: "hidden md:table-cell", lg: "hidden lg:table-cell" };

export function DataTable<T>({
  columns,
  data,
  rowKey,
  searchPlaceholder = "Search…",
  searchAccessor,
  filters = [],
  onRowClick,
  pageSize = 10,
  emptyState,
  toolbarExtra,
  initialSort = null,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(initialSort);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let rows = data;
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter((row) => searchAccessor(row).toLowerCase().includes(q));
    for (const filter of filters) {
      const value = filterValues[filter.id] ?? "";
      if (value) rows = rows.filter((row) => filter.accessor(row) === value);
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.accessor) {
        rows = [...rows].sort((a, b) => {
          const av = col.accessor!(a);
          const bv = col.accessor!(b);
          const cmp = typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return rows;
  }, [data, search, searchAccessor, filters, filterValues, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (key: string) => {
    setSort((prev) =>
      prev?.key === key ? (prev.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" },
    );
    setPage(0);
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2.5">
        <div className="relative min-w-44 flex-1 sm:max-w-72">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="h-8 pl-8 text-xs"
          />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.id}
            value={filterValues[filter.id] ?? ""}
            onValueChange={(value) => {
              setFilterValues((prev) => ({ ...prev, [filter.id]: value }));
              setPage(0);
            }}
          >
            <SelectTrigger className="h-8 w-auto min-w-36 text-xs">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filter.allLabel ?? `All ${filter.label.toLowerCase()}`}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        <div className="ml-auto flex items-center gap-2">{toolbarExtra}</div>
      </div>

      {visible.length === 0 ? (
        <div className="px-6 py-14">{emptyState}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "h-9 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.hideBelow && HIDE[col.hideBelow],
                    col.headerClassName,
                    col.accessor && "cursor-pointer select-none",
                  )}
                  onClick={col.accessor ? () => toggleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.accessor && sort?.key === col.key && (sort.dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow
                key={rowKey(row)}
                className={cn("h-10", onRowClick && "cursor-pointer")}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      "text-[13px]",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.hideBelow && HIDE[col.hideBelow],
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <span>
          {filtered.length === 0 ? "No rows" : `Showing ${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, filtered.length)} of ${filtered.length}`}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="px-1 tabular">Page {safePage + 1} / {pageCount}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
