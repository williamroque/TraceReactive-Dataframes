import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import * as aq from 'arquero';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export const TableEditorFrontend: React.FC<{ nodeId: string }> = ({ nodeId }) => {
    const [data, setData] = useState<any>(null);
    const [rows, setRows] = useState<Record<string, any>[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [editingCell, setEditingCell] = useState<{ rowIdx: number; col: string } | null>(null);
    const [editingColumnIdx, setEditingColumnIdx] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editColValue, setEditColValue] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const api = (window as any).api?.interactive;
        if (!api) return;

        api.requestData(nodeId);

        const unsubData = api.onData((incomingData: any) => {
            setData(incomingData);
            
            const outRaw = incomingData.output?.Data;
            
            const rawData = (outRaw && outRaw.__arqueroData) ? outRaw : null;
            
            if (rawData && rawData.__arqueroData) {
                try {
                    const table = aq.from(rawData.__arqueroData);
                    const cols = table.columnNames();
                    const newRows = table.objects();
                    setColumns(cols);
                    setRows(newRows);
                    setHasUnsavedChanges(false);
                } catch (e) {
                    console.error("Failed to parse arquero data:", e);
                }
            } else {
                setColumns(['Column1']);
                setRows([ { 'Column1': '' } ]);
            }
        });

        return () => {
            if (unsubData) unsubData();
        };
    }, [nodeId]);

    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingCell]);

    const handleSave = useCallback(() => {
        const api = (window as any).api?.interactive;
        if (api) {
            api.setOutput(nodeId, { Data: { __arqueroData: rows } });
            if (api.setProperty) {
                api.setProperty(nodeId, 'tableData', rows);
            }
            setHasUnsavedChanges(false);
        }
    }, [nodeId, rows]);

    const handleAddRow = () => {
        const newRow: Record<string, any> = {};
        columns.forEach(col => newRow[col] = null);
        setRows([...rows, newRow]);
        setHasUnsavedChanges(true);
    };
    
    const handleDeleteRow = (idx: number) => {
        const newRows = [...rows];
        newRows.splice(idx, 1);
        setRows(newRows);
        setHasUnsavedChanges(true);
    };

    const handleAddColumn = () => {
        const newCol = `Column${columns.length + 1}`;
        setColumns([...columns, newCol]);
        const newRows = rows.map(r => ({ ...r, [newCol]: null }));
        setRows(newRows);
        setHasUnsavedChanges(true);
    };

    const commitEdit = () => {
        if (!editingCell) return;
        const { rowIdx, col } = editingCell;
        
        // Auto type conversion
        let finalVal: any = editValue;
        if (editValue.trim() !== '') {
            const num = Number(editValue);
            if (!isNaN(num)) finalVal = num;
        } else {
            finalVal = null;
        }

        const newRows = [...rows];
        newRows[rowIdx] = { ...newRows[rowIdx], [col]: finalVal };
        setRows(newRows);
        setEditingCell(null);
        setHasUnsavedChanges(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            commitEdit();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    const commitColEdit = () => {
        if (editingColumnIdx === null) return;
        const newColName = editColValue.trim() || `Column${editingColumnIdx + 1}`;
        
        const oldColName = columns[editingColumnIdx];
        if (oldColName === newColName) {
            setEditingColumnIdx(null);
            return;
        }

        const newCols = [...columns];
        newCols[editingColumnIdx] = newColName;
        
        const newRows = rows.map(r => {
            const nr = { ...r };
            nr[newColName] = nr[oldColName];
            delete nr[oldColName];
            return nr;
        });

        setColumns(newCols);
        setRows(newRows);
        setEditingColumnIdx(null);
        setHasUnsavedChanges(true);
    };

    const handleColKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            commitColEdit();
        } else if (e.key === 'Escape') {
            setEditingColumnIdx(null);
        }
    };

    if (!data) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--secondary-text-color)' }}>
                Loading table data...
            </div>
        );
    }

    return (
        <div style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'var(--background-color)',
            color: 'var(--text-color)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            boxSizing: 'border-box'
        }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                marginBottom: '16px',
                borderRadius: '12px',
                backgroundColor: 'var(--tertiary-color)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary-color)', fontSize: '15px' }}>
                        Dataframe Editor
                    </div>
                    <div style={{ color: 'var(--secondary-text-color)', fontSize: '12px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
                        {rows.length} rows × {columns.length} cols
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleAddColumn}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                            backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)',
                            fontSize: '12px', fontWeight: 500
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--secondary-color)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <PlusIcon style={{ width: 14, height: 14 }} /> Column
                    </button>
                    <button
                        onClick={handleAddRow}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                            backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)',
                            fontSize: '12px', fontWeight: 500
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--secondary-color)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <PlusIcon style={{ width: 14, height: 14 }} /> Row
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 16px', borderRadius: '6px', 
                            cursor: hasUnsavedChanges ? 'pointer' : 'default',
                            backgroundColor: hasUnsavedChanges ? 'var(--primary-color)' : 'var(--secondary-color)', 
                            border: 'none', 
                            color: hasUnsavedChanges ? 'var(--background-color)' : 'var(--secondary-text-color)',
                            fontSize: '12px', fontWeight: 600,
                            opacity: hasUnsavedChanges ? 1 : 0.6
                        }}
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--tertiary-color)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                position: 'relative'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 'max-content' }}>
                    <thead>
                        <tr>
                            <th style={{
                                width: '40px',
                                padding: '10px 0',
                                borderBottom: '1px solid var(--border-color)',
                                borderRight: '1px solid var(--border-color)',
                                position: 'sticky', top: 0, left: 0,
                                backgroundColor: 'var(--glass-background-color)',
                                backdropFilter: 'blur(10px)', zIndex: 3
                            }}></th>
                            {columns.map((col, idx) => (
                                <th key={idx} 
                                    onClick={() => {
                                        setEditingColumnIdx(idx);
                                        setEditColValue(col);
                                    }}
                                    style={{ 
                                    padding: '0', 
                                    borderBottom: '1px solid var(--border-color)',
                                    borderRight: idx < columns.length - 1 ? '1px solid var(--border-color)' : 'none',
                                    textAlign: 'left',
                                    position: 'sticky', top: 0,
                                    backgroundColor: 'var(--glass-background-color)',
                                    backdropFilter: 'blur(10px)', zIndex: 2,
                                    fontWeight: 500,
                                    color: 'var(--text-color)',
                                    cursor: 'text',
                                    minWidth: '100px'
                                }}>
                                    <div style={{ padding: '10px 16px', opacity: editingColumnIdx === idx ? 0 : 1 }}>
                                        {col}
                                    </div>
                                    {editingColumnIdx === idx && (
                                        <input
                                            autoFocus
                                            value={editColValue}
                                            onChange={(e) => setEditColValue(e.target.value)}
                                            onBlur={commitColEdit}
                                            onKeyDown={handleColKeyDown}
                                            style={{
                                                position: 'absolute', top: 0, left: 0,
                                                width: '100%', height: '100%',
                                                padding: '9px 15px', boxSizing: 'border-box',
                                                border: '1px solid var(--primary-color)', outline: 'none',
                                                backgroundColor: 'var(--background-color)', color: 'var(--text-color)',
                                                fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'bold'
                                            }}
                                        />
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIdx) => (
                            <tr key={rowIdx} 
                                style={{ backgroundColor: rowIdx % 2 === 0 ? 'transparent' : 'var(--secondary-color)' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-highlight-color)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowIdx % 2 === 0 ? 'transparent' : 'var(--secondary-color)'}
                            >
                                <td style={{
                                    borderBottom: '1px solid var(--border-color)',
                                    borderRight: '1px solid var(--border-color)',
                                    textAlign: 'center',
                                    position: 'sticky', left: 0,
                                    backgroundColor: 'inherit', zIndex: 1
                                }}>
                                    <button 
                                        onClick={() => handleDeleteRow(rowIdx)}
                                        style={{ 
                                            background: 'none', border: 'none', color: 'var(--secondary-text-color)', 
                                            cursor: 'pointer', padding: '4px', opacity: 0.6 
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#ef4444'; }}
                                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.color = 'var(--secondary-text-color)'; }}
                                    >
                                        <TrashIcon style={{ width: 14, height: 14 }} />
                                    </button>
                                </td>
                                {columns.map((col, colIdx) => {
                                    const val = row[col];
                                    const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.col === col;
                                    const displayVal = val === null || val === undefined ? '' : String(val);
                                    const isNull = val === null || val === undefined;
                                    const isNumber = typeof val === 'number';

                                    return (
                                        <td key={colIdx} 
                                            onClick={() => {
                                                setEditingCell({ rowIdx, col });
                                                setEditValue(displayVal);
                                            }}
                                            style={{ 
                                                padding: '0', 
                                                borderBottom: '1px solid var(--border-color)',
                                                borderRight: colIdx < columns.length - 1 ? '1px solid var(--border-color)' : 'none',
                                                color: isNull ? 'var(--secondary-text-color)' : (isNumber ? 'var(--primary-color)' : 'var(--text-color)'),
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '250px',
                                                fontFamily: isNumber ? "'Victor Mono', monospace" : 'inherit',
                                                cursor: 'text',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ padding: '8px 16px', opacity: isEditing ? 0 : (isNull ? 0.5 : 1) }}>
                                                {isNull ? 'null' : displayVal}
                                            </div>
                                            {isEditing && (
                                                <input
                                                    ref={inputRef}
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={commitEdit}
                                                    onKeyDown={handleKeyDown}
                                                    style={{
                                                        position: 'absolute', top: 0, left: 0,
                                                        width: '100%', height: '100%',
                                                        padding: '8px 16px', boxSizing: 'border-box',
                                                        border: '2px solid var(--primary-color)', outline: 'none',
                                                        backgroundColor: 'var(--background-color)', color: 'var(--text-color)',
                                                        fontFamily: 'inherit', fontSize: 'inherit'
                                                    }}
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ padding: '32px', textAlign: 'center', color: 'var(--secondary-text-color)' }}>
                                    No data. Click "Row" to add a row.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
