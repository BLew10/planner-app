"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Table.module.scss";

interface TableProps {
  tableName: string;
  columns: string[];
  style?: "small" | "medium" | "large";
  data?: any[][];
  addPath?: string; // This is a path to a form to add a new row to the table
}

const Table = ({ tableName, columns, data, addPath, style = 'medium' }: TableProps) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = data?.filter(row =>
        row.some(cell =>
          cell.toString().toLowerCase().includes(lowercasedQuery)
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchQuery, data]);

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <h1 className={styles.tableName}>{tableName}</h1>
        {addPath && (
          <Link href={addPath} className={styles.addButton}>
            Add 
          </Link>
        )}
      </div>
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
      />
      <table className={`${styles.table} ${styles[style]}`}>
        <thead className={styles.tableHead}>
          <tr className={styles.row}>
            {columns.map((column, index) => (
              <th key={index} className={styles.cellHead}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {filteredData?.map((rowData, rowIndex) => (
            <tr key={rowIndex} className={styles.row}>
              {rowData.map((cellData, cellIndex) => (
                <td key={cellIndex} className={styles.cell}>
                  {cellData}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;