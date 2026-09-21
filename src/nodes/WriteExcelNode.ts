import { ExecuteNode } from '@tracereactive/types';
import * as aq from 'arquero';
import * as XLSX from 'xlsx';

import type { TraceReactiveAPI } from '@tracereactive/types';

declare const traceReactive: TraceReactiveAPI;

export class WriteExcelNode extends ExecuteNode {
    readonly category = { name: 'I/O', accent: 'sky-500' } as any;
    readonly typeId = 'writeExcel';
    readonly displayName = 'Write Excel';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [];
    readonly properties = [
        {
            name: 'filePath',
            label: 'Output File Path',
            type: 'filepath' as const,
            defaultValue: ''
        },
        {
            name: 'sheetName',
            label: 'Sheet Name',
            type: 'text' as const,
            defaultValue: 'Sheet1'
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        const filePath = properties.filePath as string;
        
        if (!table || !filePath) return {};

        try {
            // Convert to JSON array of objects
            const jsonData = table.objects();
            
            // Create a new workbook and add the worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(jsonData);
            XLSX.utils.book_append_sheet(workbook, worksheet, properties.sheetName || 'Sheet1');
            
            // Generate binary string
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            
            // Write to file system using standard write (might need a buffer writer in real app, but for now we write string)
            // Note: Since ipcBridge writeFile takes string, we should use base64 or pass buffer.
            // For now, traceReactive.fs.writeFile might corrupt binary if strictly string. 
            // The proper way in node for buffer would be:
            // But packages run in renderer. We can send a base64 string and have ipc bridge decode it,
            // or pass Uint8Array if IPC supports it (Electron IPC does support Uint8Array).
            await traceReactive.fs.writeFile(filePath, excelBuffer);
            return {};
        } catch (err) {
            console.error('Failed to write Excel:', err);
            return {};
        }
    }
}
