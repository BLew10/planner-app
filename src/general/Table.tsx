import React from "react";
import styles from "./Table.module.scss";

interface TableProps {
  tableName: string;
  columns: string[];
  data?: any[][];
}

const Table = ({ tableName, columns, data }: TableProps) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.tableName}>{tableName}</h1>
      <table className={styles.table}>
        <thead>
          <tr className={styles.row}>
            {columns.map((column, index) => (
              <th key={index} className={styles.cell}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((rowData, rowIndex) => (
            <tr key={rowIndex} className={styles.cell}>
              {rowData.map((cellData, cellIndex) => (
                <td key={cellIndex} className={styles.cell}>{cellData}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
