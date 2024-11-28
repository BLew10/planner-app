"use client";

import React, { useState, useEffect, } from "react";
import Link from "next/link";
import styles from "./Table.module.scss";
import TextInput from "../form/TextInput";
import SelectInput from "../form/SelectInput";
import LoadingSpinner from "./LoadingSpinner";

interface TableProps {
  tableName: string;
  columns: { name: string; size: string; wrap?: boolean }[];
  data?: any[][];
  addPath?: string;
  filterValue?: string;
  filterOptions?: { value: string; label: string }[];
  handleFilterChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  filterOptionsTwo?: { value: string; label: string }[];
  handleFilterChangeTwo?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedAction?: () => void;
  selectActionDescription?: string;
  selectedCount?: number;
  toggleSelectAll?: () => void;
  allSelected?: boolean;
}

const Table = ({
  tableName,
  columns,
  data,
  addPath,
  filterValue,
  filterOptions,
  handleFilterChange,
  filterOptionsTwo,
  handleFilterChangeTwo,
  selectedAction,
  selectedCount,
  toggleSelectAll,
  allSelected,
  selectActionDescription,
}: TableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [fetchingData, setFetchingData] = useState(!data);
  const [filteredColumn, setFilteredColumn] = useState<number | null>(null);
  useEffect(() => {
    if (!data) return;
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = data.filter((row) => {
      if (filteredColumn != null) {
        const cell = row[filteredColumn];
        return cell != null && cell.toString().toLowerCase().includes(lowercasedQuery);
      }
      return row.some((cell) => {
        if (
          cell &&
          typeof cell == "object" &&
          cell.props &&
          cell.props["dataset-search"]
        ) {
          return cell.props["dataset-search"]
            .toLowerCase()
            .includes(lowercasedQuery);
        } 
        return cell != null && cell.toString().toLowerCase().includes(lowercasedQuery);
      });
    });
    setFetchingData(false);
    setFilteredData(filtered);
  }, [searchQuery, data, filteredColumn]);

  const handleColumnClick = (index: number) => {
    if (filteredColumn === index) {
      setFilteredColumn(null);
      setSearchQuery("");
    } else {
      setFilteredColumn(index);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <h1 className={styles.tableHeader}>
          {<span className={styles.tableName}>{tableName}</span>}
          <span className={styles.resultsTotal}> Results: {data?.length}</span>
        </h1>
      </div>
      <div className={styles.subHeading}>
        <div className={styles.searchWrapper}>
          <div className={styles.filterWrapper}>
            <TextInput
              type="text"
              name="search-query"
              id="table-search"
              label="Search"
              placeholder={`Search ${
                filteredColumn !== null
                  ? ` in ${columns[filteredColumn].name}`
                  : ""
              }...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autocomplete="new-password"
            />
            {filterOptions && filterOptions.length > 0 && (
              <SelectInput
                name="filter"
                label="Filter"
                value={filterValue}
                options={filterOptions}
                onChange={handleFilterChange}
              />
            )}
            {filterOptionsTwo && filterOptionsTwo.length > 0 && (
              <SelectInput
                name="filter-two"
                label=""
                options={filterOptionsTwo}
                onChange={handleFilterChangeTwo}
              />
            )}
          </div>
          {filteredColumn !== null ? (
            <p className={styles.filterDescription}>
              Filtering by:{" "}
              <span className={styles.filterTerm}>
                {columns[filteredColumn].name}
              </span>
              <button
                className={styles.clearFilter}
                onClick={() => handleColumnClick(filteredColumn)}
              >
                Clear
              </button>
            </p>
          ) : (
            <p className={styles.filterDescription}>
              Search the entire table or click a column to filter by it.
            </p>
          )}
          {toggleSelectAll && (
            <button
              className={styles.selectAllButton}
              onClick={toggleSelectAll}
            >
              {allSelected ? `Deselect all` : `Select all`}
            </button>
          )}
        </div>
        <div className={styles.addDeleteWrapper}>
          {addPath && (
            <Link href={addPath} className={styles.addButton}>
              Add
            </Link>
          )}
          {selectedAction && (
            <button
              className={`${selectActionDescription?.includes("Delete") ? styles.deleteButton : styles.selectAction}`}
              onClick={selectedAction}
            >
              {selectActionDescription} ({selectedCount})
            </button>
          )}
        </div>
      </div>
      {fetchingData ? (
        <LoadingSpinner />
      ) : (
        <table className={`${styles.table}`}>
          <thead className={styles.tableHead}>
            <tr className={styles.row}>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`${styles.cellHead} ${styles[column.size]}`}
                  onClick={() => handleColumnClick(index)}
                >
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {filteredData?.map((rowData, rowIndex) => (
              <tr key={rowIndex} className={styles.row}>
                {rowData
                  .filter((cellData, cellIndex) => columns[cellIndex])
                  .map((cellData, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`${styles.cell} ${
                        styles[columns[cellIndex].size]
                      } ${columns[cellIndex].wrap ? styles.wrap : ""}`}
                    >
                      {cellData}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Table;
