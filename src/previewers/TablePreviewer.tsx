import React, { useMemo } from 'react';
import * as aq from 'arquero';
import { PreviewerProps } from '@tracereactive/types';

export const TablePreviewer: React.FC<PreviewerProps> = ({ data, width, height }) => {
    const table = data as aq.internal.Table;
    
    const { columns, rows } = useMemo(() => {
        if (!table) return { columns: [], rows: [] };
        
        // Take up to 1000 rows for preview to avoid freezing
        const maxRows = Math.min(table.numRows(), 1000);
        const colNames = table.columnNames();
        
        const previewRows = [];
        for (let i = 0; i < maxRows; i++) {
            const row: Record<string, any> = {};
            for (const col of colNames) {
                row[col] = table.get(col, i);
            }
            previewRows.push(row);
        }
        
        return { columns: colNames, rows: previewRows };
    }, [table]);

    if (!table) {
        return <div style={{ padding: 20, color: '#888' }}>No dataframe data</div>;
    }

    return (
        <div style={{ 
            width: width || '100%', 
            height: height || '100%', 
            overflow: 'auto',
            backgroundColor: '#1E1E1E',
            color: '#E0E0E0',
            fontFamily: 'monospace',
            fontSize: '12px'
        }}>
            <div style={{ padding: '8px', borderBottom: '1px solid #333', backgroundColor: '#252526' }}>
                <strong>Dataframe</strong> | {table.numRows()} rows × {table.numCols()} cols 
                {table.numRows() > 1000 ? ' (showing first 1000)' : ''}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} style={{ 
                                padding: '6px 12px', 
                                borderBottom: '1px solid #444',
                                borderRight: '1px solid #333',
                                textAlign: 'left',
                                position: 'sticky',
                                top: 0,
                                backgroundColor: '#2D2D2D',
                                zIndex: 1
                            }}>
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIdx) => (
                        <tr key={rowIdx} style={{ backgroundColor: rowIdx % 2 === 0 ? '#1E1E1E' : '#222222' }}>
                            {columns.map((col, colIdx) => {
                                const val = row[col];
                                const displayVal = val === null || val === undefined ? 'null' : String(val);
                                const isNull = val === null || val === undefined;
                                return (
                                    <td key={colIdx} style={{ 
                                        padding: '4px 12px', 
                                        borderBottom: '1px solid #333',
                                        borderRight: '1px solid #333',
                                        color: isNull ? '#777' : '#E0E0E0',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '200px'
                                    }}>
                                        {displayVal}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
